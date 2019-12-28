import pg from "pg"
import SQL from "../sql/index"
import { isArray } from "util";
// 数据库配置
const SQLconfig = {
    user: "postgres",
    database: "postgres",
    password: "password",
    port: 5432,
    // 扩展属性
    max: 20, // 连接池最大连接数
    idleTimeoutMillis: 3000, // 连接最大空闲时间 3s
}
export default class PG {
    public static Client = new pg.Pool(SQLconfig);
    constructor() {
        console.log("准备向PGSQL数据库连接...");
    }

    public static async getConnection() {
        let isConnect = await new Promise((resolve) => {
            PG.Client.connect(function (err) {
                if (err) {
                    console.error('could not connect to postgres', err);
                    resolve(false);
                }
                PG.Client.query('SELECT NOW() AS "theTime"', function (err, result) {
                    if (err) {
                        console.error('error running query', err);
                        resolve(false);
                    }
                    console.log("hbdfxt数据库连接成功...");
                    resolve(true);
                });
            });
        });
        if (!isConnect) {
            return false;
        }
        //let res = await PG.query(SQL.CommonData, { table: "room" }).catch(err => { console.error(err); });
        //let room = await PG.query(SQL.RoomData,{block_name:"1栋",community_id:[2,3]},{limit:1,offset:0}).catch(err => {console.error(err);});
        //let submit = await PG.query(SQL.SubmitData, { id: 1 }, null, {
        //    tel: 345
        //})
        //debugger;
        //获取用户信息总数量
        //let count = await PG.query(SQL.UserTotal);
        //尝试获取5条用户数据
        //let data = await PG.query(SQL.UserDataPaging, { limit: 5 });
        //console.log("[测试完成]", data);
        return true;
    };
    /**
     * 使用标准的SQL指令请求数据库
     * @param sql 
     * @param params 
     * @param values 
     * @param returnFields 
     */
    static async query(sql: SQL, where?: any, params?: any, values?: any, returnFields?: (new (any: any) => any)[]) {
        //使用指定的返回格式
        sql.returnFields = returnFields ? returnFields : sql.returnFields;
        //预处理指令
        sql = sql.before ? sql.before(sql, where, params, values) : sql;
        this.replace(sql, params, "params");
        let res = await PG.Client.query(sql.cmd);
        return this.formatting(res, sql.returnFields);
    }
    private static replace(sql, value, field, onReplace = (value: any) => {
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
    private static formatting(res, returnFields) {
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
    static clientHelper = function (str, value, cb) {
        PG.Client.query(str, value, function (err, result) {
            if (err) {
                cb("err");
            }
            else {
                if (result.rows != undefined)
                    cb(result.rows);
                else
                    cb();
            }
        });
    }

    //增
    //@param tablename 数据表名称
    //@param fields 更新的字段和值，json格式
    //@param cb 回调函数
    public static save(tablename, fields, cb) {
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
    public static remove(tablename, fields, cb) {
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
    public static update(tablename, mainfields, fields, cb) {
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
    public static select(tablename, fields, returnfields, cb) {
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

    public static next() {

    }
}