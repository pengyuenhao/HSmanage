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
const mongodb_1 = __importDefault(require("mongodb"));
const util_1 = require("util");
const MongoConfig = {
    url: "mongodb://localhost:27017/"
};
class Mongo {
    constructor() {
        console.log("准备向Mongo数据库连接...");
    }
    static ObjectId(id) {
        return new mongodb_1.default.ObjectId(id);
    }
    static getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isConnect = yield new Promise((resolve) => {
                mongodb_1.default.MongoClient.connect(MongoConfig.url, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }, function (err, db) {
                    if (err) {
                        resolve(false);
                    }
                    else {
                        console.log("数据库连接成功!");
                        //连接到数据库
                        Mongo.dbo = db.db("3C0930E9280E757B519E7B761CEF6371");
                        resolve(true);
                    }
                });
            });
            if (!this.isConnect) {
                return false;
            }
            //权限设置 0 = none ,1 = info ,2 = reader ,3 = agency,4 = manager ,5 = editer ,6 = admin
            //none - 仅可获取名称
            //info - 可获取基本信息
            //reader - 可获取全部信息
            //agency - 可代理部分管理者的功能
            //manager - 可管理和使用功能
            //editer - 可管理和编辑功能
            //admin - 超级管理员，拥有全部权限
            //await Mongo.delete({id:2});
            let res = yield Mongo.find({ id: 1 });
            let array = yield Mongo.findToArray({ upper: 1 });
            let all = yield Mongo.findToArray({});
            return true;
        });
    }
    ;
    static update(keys, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.isConnect) {
                    reject("mongo is not readly");
                    return;
                }
                let filter = {};
                if (util_1.isArray(keys)) {
                    //获取更新关键字
                    for (let key of keys) {
                        filter[key] = data[key];
                    }
                }
                else {
                    if (typeof keys == "string") {
                        filter[keys] = data[keys];
                    }
                    else {
                        filter = keys;
                    }
                }
                Mongo.dbo.collection("user").updateOne(filter, {
                    $set: data
                }, { upsert: true }, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        //console.log("数据更新成功");
                        resolve(res);
                    }
                });
            });
        });
    }
    static find(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.isConnect) {
                    reject("mongo is not readly");
                    return;
                }
                Mongo.dbo.collection("user").findOne(filter, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        //console.log("数据读取成功");
                        resolve(res);
                    }
                });
            });
        });
    }
    static findToArray(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.isConnect) {
                    reject("mongo is not readly");
                    return;
                }
                Mongo.dbo.collection("user").find(filter).toArray((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        //console.log("数据读取成功");
                        resolve(res);
                    }
                });
            });
        });
    }
    static delete(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.isConnect) {
                    reject("mongo is not readly");
                    return;
                }
                Mongo.dbo.collection("user").deleteOne(filter).then(resolve).catch(reject);
            });
        });
    }
}
exports.default = Mongo;
Mongo.isConnect = false;
//# sourceMappingURL=mongouitl.js.map