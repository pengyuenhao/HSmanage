import mongo from "mongodb";
import { isArray } from "util";

const MongoConfig = {
    url: "mongodb://localhost:27017/"
}


export default class Mongo {
    public static isConnect = false;
    constructor() {
        console.log("准备向Mongo数据库连接...");
    }
    public static dbo: mongo.Db;
    public static ObjectId(id){
        return new mongo.ObjectId(id);
    }
    public static async getConnection() {
        this.isConnect = await new Promise((resolve) => {
            mongo.MongoClient.connect(MongoConfig.url,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }, function (err, db) {
                    if (err) {
                        resolve(false);
                    } else {
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
        let res = await Mongo.find({ id: 1 });
        let array = await Mongo.findToArray({ upper: 1 });
        let all = await Mongo.findToArray({});
        return true;
    };

    public static async update(keys, data) {
        return new Promise((resolve, reject) => {
            if (!this.isConnect) { reject("mongo is not readly"); return; }
            let filter = {};
            if (isArray(keys)) {
                //获取更新关键字
                for (let key of keys) {
                    filter[key] = data[key];
                }
            } else {
                if (typeof keys == "string") {
                    filter[keys] = data[keys];
                } else {
                    filter = keys;
                }
            }
            Mongo.dbo.collection("user").updateOne(filter, {
                $set: data
            }, { upsert: true }, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    //console.log("数据更新成功");
                    resolve(res);
                }
            })
        })
    }

    public static async find(filter): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.isConnect) { reject("mongo is not readly"); return; }
            Mongo.dbo.collection("user").findOne(filter, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    //console.log("数据读取成功");
                    resolve(res);
                }
            })
        })
    }

    public static async findToArray(filter) {
        return new Promise((resolve, reject) => {
            if (!this.isConnect) { reject("mongo is not readly"); return; }
            Mongo.dbo.collection("user").find(filter).toArray((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    //console.log("数据读取成功");
                    resolve(res);
                }
            });
        })
    }

    public static async delete(filter) {
        return new Promise((resolve, reject) => {
            if (!this.isConnect) { reject("mongo is not readly"); return; }
            Mongo.dbo.collection("user").deleteOne(filter).then(resolve).catch(reject);
        })
    }
}