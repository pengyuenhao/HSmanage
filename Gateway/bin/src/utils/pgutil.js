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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var pg = require('pg');
// 数据库配置
var SQLconfig = {
    user: "postgres",
    database: "postgres",
    password: "password",
    port: 5432,
    // 扩展属性
    max: 20,
    idleTimeoutMillis: 3000,
};
var PG = /** @class */ (function () {
    function PG() {
        console.log("准备向****数据库连接...");
    }
    PG.getConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
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
                    })];
            });
        });
    };
    ;
    //增
    //@param tablename 数据表名称
    //@param fields 更新的字段和值，json格式
    //@param cb 回调函数
    PG.save = function (tablename, fields, cb) {
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
    };
    ;
    //删除
    //@param tablename 数据表名称
    //@param fields 条件字段和值，json格式
    //@param cb 回调函数
    PG.remove = function (tablename, fields, cb) {
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
    };
    //修改
    //@param tablename 数据表名称
    //@param fields 更新的字段和值，json格式
    //@param mainfields 条件字段和值，json格式
    PG.update = function (tablename, mainfields, fields, cb) {
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
    };
    //查询
    //@param tablename 数据表名称
    //@param fields 条件字段和值，json格式
    //@param returnfields 返回字段
    //@param cb 回调函数
    PG.select = function (tablename, fields, returnfields, cb) {
        if (!tablename)
            return;
        var returnStr = "";
        if (returnfields.length == 0)
            returnStr = '*';
        else
            returnStr = returnfields.join(",");
        var str = "select " + returnStr + " from " + tablename + " where ";
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
    };
    ;
    PG.Client = new pg.Pool(SQLconfig);
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
    return PG;
}());
exports.default = PG;
//# sourceMappingURL=pgutil.js.map