import { RedisClient, ClientOpts, RedisError } from "redis";
/**
 * Redis操作代理类，统一处理所有Redis相关事务
 */
export default class AgentRedis {
    private _client: RedisClient;
    /**只读Reids处理客户端 */
    private get client(): RedisClient {
        if (!this._client) throw new RedisError("[Redis尚未连接]");
        return this._client;
    };
    /**
     * 如果存在有效的config配置则直接连接Reids服务，
     * 否则需要主动调用connecting方法进行连接
     * @param config 
     */
    constructor(config?: ClientOpts) {
        if (config) this.connecting(config);
    }
    /**连接Reids服务器 */
    public connecting(config: ClientOpts) {
        this._client = new RedisClient(config);
    }
    /**断开Redis连接 */
    public async close() {
        new Promise((resolve, reject) => {
            this.client.quit((err, res) => {
                if (err) { reject(err); }
                resolve(res);
            });
        })
    }

    public async get(key: string | number) {
        return new Promise((resolve, reject) => {
            this.client.get(key as string, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        })
    }
    public async set(key: string | number, value: any) {
        return new Promise((resovle, reject) => {
            this.client.set(key as string, value, (err, result) => {
                if (err) {
                    reject(err);
                }
                resovle(result);
            });
        })
    }
    public async mget(keys: string[]) {
        return new Promise((resolve, reject) => {
            this.client.mget(keys, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        })
    }
}