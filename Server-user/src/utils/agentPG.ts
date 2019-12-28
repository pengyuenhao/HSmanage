import { Pool, PoolConfig } from "pg"
import SQL from "./sql2PG"
import { isArray } from "util";

export default class AgentPG {
    public _client: Pool
    public get client(): Pool {
        if (!this._client) throw new Error("[PG尚未连接]");
        return this._client;
    }
    constructor(config: PoolConfig) {
        if (config) this.connecting(config);
    }

    /**连接PG服务器 */
    public connecting(config: PoolConfig) {
        this._client = new Pool(config);
    };
    public async close() {
        return this.client.end()
    }
    /**
     * 使用标准的SQL指令请求数据库
     * @param sql 
     * @param params 
     * @param values 
     * @param returnFields 
     */
    public async query(sql: SQL, where?: any, params?: any, values?: any, returnFields?: (new (any: any) => any)[]) {
        //使用指定的返回格式
        sql.returnFields = returnFields ? returnFields : sql.returnFields;
        //预处理指令
        sql = sql.before ? sql.before(sql, where, params, values) : sql;
        this.replace(sql, params, "params");
        let res = await this.client.query(sql.cmd);
        return this.formatting(res, sql.returnFields);
    }
    private replace(sql, value, field, onReplace = (value: any) => {
        if(value == "*")return value;
        if (typeof value == "string") {
            return '"' + value + '"';
        }
        return value;
    }) {
        //处理指令参数
        if (sql[field] != null) {
            let keys;
            if (isArray(sql[field])) {
                keys = sql[field];
            } else {
                keys = Object.keys(sql[field]);
                if (value != null) {
                    for (let key of keys) {
                        //为所有未定义的参数值赋予默认值
                        if (value[key] === undefined) {
                            value[key] = sql[field][key];
                        }
                    }
                } else {
                    value = value ? value : sql[field];
                }
            }
            if (value == null) return;
            //替换指令中变量的位置
            for (let key of keys) {
                if (value[key] == null) continue;
                let str = "";
                if (isArray(value[key])) {
                    for (let i = 0; i < value[key].length; i++) {
                        str += onReplace(value[key][i]);
                        if (i < value[key].length - 1) {
                            str += ","
                        }
                    }
                } else {
                    str = onReplace(value[key]);
                }
                sql.cmd = sql.cmd.replace("{" + key + "}", str);
            }
        }
    }
    //数据格式化处理
    private formatting(res, returnFields) {
        let result = [];
        if (returnFields && returnFields.length > 0) {
            for (let i = 0; i < res.rowCount; i++) {
                result[i] = {};
                for (let j = 0; j < returnFields.length; j++) {
                    let field = res.fields[j].name;
                    let type = returnFields[j];
                    if (type == Array) {
                        result[i][field] = res.rows[i][field] ? new type(...res.rows[i][field]) : [];
                    } else {
                        //转换为指定的数据类型
                        result[i][field] = type(res.rows[i][field]);
                    }
                }
            }
        } else {
            result = res;
        }
        return result;
    }
    // 查询函数
    //@param str 查询语句
    //@param value 相关值
    //@param cb 回调函数
    public clientHelper(str: string, value, cb) {
        return this.client.query(str, value, cb);
    }
    public async create(tablename, fields: { name: string, type: string }[]) {
        if (!tablename) return;
        return new Promise((resolve, reject) => {
            let str = `CREATE TABLE ${tablename} `;
            let end = "(";
            for (let field of fields) {
                str += end;
                str += ` ${field.name} ${field.type} `;
                end = ','
            }
            str += ")";
            this.clientHelper(str, null, (err, res) => {
                if(err){reject(err)};
                resolve(res);
            });
        })
    }
    //增
    //@param tablename 数据表名称
    //@param fields 更新的字段和值，json格式
    //@param cb 回调函数
    public save(tablename, fields, cb) {
        if (!tablename) return;
        var str = "insert into " + tablename + "(";
        var field = [];
        var value = [];
        var num = [];
        var count = 0;
        for (var i in fields) {
            count++;
            field.push(i);
            value.push(fields[i]);
            num.push("$" + count);
        }
        str += field.join(",") + ") values(" + num.join(",") + ")";
        this.clientHelper(str, value, cb);
    };

    //删除
    //@param tablename 数据表名称
    //@param fields 条件字段和值，json格式
    //@param cb 回调函数
    public remove(tablename, fields, cb) {
        if (!tablename) return;
        var str = "delete from " + tablename + " where ";
        var field = [];
        var value = [];
        var count = 0;
        for (var i in fields) {
            count++;
            field.push(i + "=$" + count);
            value.push(fields[i]);
        }
        str += field.join(" and ");
        this.clientHelper(str, value, cb);
    }


    //修改
    //@param tablename 数据表名称
    //@param fields 更新的字段和值，json格式
    //@param mainfields 条件字段和值，json格式
    public update(tablename, mainfields, fields, cb) {
        if (!tablename) return;
        var str = "update " + tablename + " set ";
        var field = [];
        var value = [];
        var count = 0;
        for (var i in fields) {
            count++;
            field.push(i + "=$" + count);
            value.push(fields[i]);
        }
        str += field.join(",") + " where ";
        field = [];
        for (var j in mainfields) {
            count++;
            field.push(j + "=$" + count);
            value.push(mainfields[j]);
        }
        str += field.join(" and ");
        this.clientHelper(str, value, cb);
    }


    //查询
    //@param tablename 数据表名称
    //@param fields 条件字段和值，json格式
    //@param returnfields 返回字段
    //@param cb 回调函数
    public select(tablename, fields, returnfields, cb) {
        if (!tablename) return;
        var returnStr = "";
        if (returnfields.length == 0 || returnfields == "*")
            returnStr = '*';
        else
            returnStr = returnfields.join(",");
        var str = "select " + returnStr + " from " + tablename;
        let value;
        if (returnfields == "*") {
            str += "";
            value = "*";
        } else {
            str += " where "
            var field = [];
            value = [];
            var count = 0;
            for (var i in fields) {
                count++;
                field.push(i + "=$" + count);
                value.push(fields[i]);
            }
            str += field.join(" and ");
        }
        this.clientHelper(str, value, cb);
    };
}