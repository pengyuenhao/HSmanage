import { MongoClient, MongoClientOptions, MongoError, FilterQuery } from "mongodb";
import { isArray } from "util";

/**
 * Mongo操作代理类，统一处理所有Mongo相关事务
 */
export default class AgentMongo {
    private _client: MongoClient;
    /**只读Mongo处理客户端 */
    private get client(): MongoClient {
        if (!this._client) throw new MongoError("[Mongo尚未连接]");
        return this._client;
    };

    constructor(uri?: string, config?: MongoClientOptions) {
        if (uri) {
            this.connecting(uri, config);
        }
    }

    /**连接Mongo服务器 */
    public connecting(uri: string, config: MongoClientOptions) {
        new MongoClient(uri, config).connect().then((client=>this._client=client));
    }
    /**断开Mongo连接 */
    public async close(){
        return this.client.close();
    }

    public async set(keys: string | string[], value: any) {
        //let connect = await this.client.connect();
        let collection = this.client.db("admin").collection("user");
        let filter = {};
        if (isArray(keys)) {
            //获取更新关键字
            for (let key of keys) {
                filter[key] = value[key];
            }
        } else {
            if (typeof keys == "string") {
                filter[keys] = value[keys];
            } else {
                filter = keys;
            }
        }
        let res = await collection.updateOne(filter, {
            $set: value
        }, { upsert: true });
        return res;
    }

    public async get(key:FilterQuery<any>){
        //let connect = await this.client.connect();
        let collection = this.client.db("admin").collection("user");
        let res = collection.findOne(key);
        return res;
    }
}