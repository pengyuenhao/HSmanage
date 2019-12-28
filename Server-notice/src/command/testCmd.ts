import { Command, inject } from "peng-ioc";

import SQL from "../utils/sql2PG";

import AgentRedis from "../utils/agentRedis";
import AgentPG from "../utils/agentPG";
import AgentMongo from "../utils/agentMongo";
import OSS = require("ali-oss");

export default class TestCmd extends Command {
    @inject("redis", "notice")
    redisNotice: AgentRedis;
    @inject("oss", "client")
    oss: OSS;

    execute() {
        //this.test();
    }
    private async test() {
        let t1 = await this.redisNotice.set(0, 3);
        let res = await this.oss.put("doc.test", Buffer.from(JSON.stringify({
            id: 123,
            test: "dsfsdf"
        })));
        let url = await this.oss.signatureUrl("doc.test", {
            expires: 3600,
            method: 'GET',
            //'Content-Type' : "text/plain; charset=UTF-8"
        })
        let a = await this.oss.get("doc.test");
        let b = JSON.parse(a.content.toString());
    }
}