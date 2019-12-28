"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = __importDefault(require("pg"));
const util_1 = require("util");
// 数据库配置
const SQLconfig = {
    user: "postgres",
    database: "postgres",
    password: "password",
    port: 5432,
    // 扩展属性
    max: 20,
    idleTimeoutMillis: 3000,
};
class PG {
    constructor() {
        console.log("准备向PGSQL数据库连接...");
    }
    static getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            let isConnect = yield new Promise((resolve) => {
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
        });
    }
    ;
    /**
     * 使用标准的SQL指令请求数据库
     * @param sql
     * @param params
     * @param values
     * @param returnFields
     */
    static query(sql, where, params, values, returnFields) {
        return __awaiter(this, void 0, void 0, function* () {
            //使用指定的返回格式
            sql.returnFields = returnFields ? returnFields : sql.returnFields;
            //预处理指令
            sql = sql.before ? sql.before(sql, where, params, values) : sql;
            this.replace(sql, params, "params");
            let res = yield PG.Client.query(sql.cmd);
            return this.formatting(res, sql.returnFields);
        });
    }
    static replace(sql, value, field, onReplace = (value) => {
        if (typeof value == "string") {
            return '"' + value + '"';
        }
        return value;
    }) {
        //处理指令参数
        if (sql[field] != null) {
            let keys;
            if (util_1.isArray(sql[field])) {
                keys = sql[field];
            }
            else {
                keys = Object.keys(sql[field]);
                if (value != null) {
                    for (let key of keys) {
                        //为所有未定义的参数值赋予默认值
                        if (value[key] === undefined) {
                            value[key] = sql[field][key];
                        }
                    }
                }
                else {
                    value = value ? value : sql[field];
                }
            }
            if (value == null)
                return;
            //替换指令中变量的位置
            for (let key of keys) {
                if (value[key] == null)
                    continue;
                let str = "";
                if (util_1.isArray(value[key])) {
                    for (let i = 0; i < value[key].length; i++) {
                        str += onReplace(value[key][i]);
                        if (i < value[key].length - 1) {
                            str += ",";
                        }
                    }
                }
                else {
                    str = onReplace(value[key]);
                }
                sql.cmd = sql.cmd.replace("{" + key + "}", str);
            }
        }
    }
    //数据格式化处理
    static formatting(res, returnFields) {
        let result = [];
        if (returnFields && returnFields.length > 0) {
            for (let i = 0; i < res.rowCount; i++) {
                result[i] = {};
                for (let j = 0; j < returnFields.length; j++) {
                    let field = res.fields[j].name;
                    let type = returnFields[j];
                    if (type == Array) {
                        result[i][field] = res.rows[i][field] ? new type(...res.rows[i][field]) : [];
                    }
                    else {
                        //转换为指定的数据类型
                        result[i][field] = type(res.rows[i][field]);
                    }
                }
            }
        }
        else {
            result = res;
        }
        return result;
    }
    //增
    //@param tablename 数据表名称
    //@param fields 更新的字段和值，json格式
    //@param cb 回调函数
    static save(tablename, fields, cb) {
        if (!tablename)
            return;
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
    }
    ;
    //删除
    //@param tablename 数据表名称
    //@param fields 条件字段和值，json格式
    //@param cb 回调函数
    static remove(tablename, fields, cb) {
        if (!tablename)
            return;
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
    static update(tablename, mainfields, fields, cb) {
        if (!tablename)
            return;
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
    static select(tablename, fields, returnfields, cb) {
        if (!tablename)
            return;
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
        }
        else {
            str += " where ";
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
    }
    ;
    static next() {
    }
}
exports.default = PG;
PG.Client = new pg_1.default.Pool(SQLconfig);
// 查询函数
//@param str 查询语句
//@param value 相关值
//@param cb 回调函数
PG.clientHelper = function (str, value, cb) {
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
};
//# sourceMappingURL=pgutil.js.map