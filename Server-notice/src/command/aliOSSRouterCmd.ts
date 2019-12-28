import { Command, inject, NSignalManager, SignalManager } from "peng-ioc";
import Router from "koa-router";
import Koa from "koa";
import AgentMongo from "../utils/agentMongo";
import OSS from "ali-oss";
import fs from "fs";

export default class AliSMSRouterCmd extends Command {
    @inject(NSignalManager)
    signalMsg: SignalManager;
    @inject("router")
    router: Router;
    @inject("crypto", "md5")
    md5: (value: string) => string;
    @inject("jwt", "sign")
    sign: (value: any) => any;
    @inject("oss", "client")
    oss: OSS;
    @inject("fs")
    fs: any

    execute() {
        //请求SMS验证服务
        this.router.post("/upload/image", async (ctx, next) => {
            this.oss.useBucket("image-peng");
            this.oss.useBucket("image-peng");
            let query = ctx.request.fields;
            let user = query.user;
            let map = [];
            for (let file of query.image) {
                let ext = this.getExt(file.type);
                let reader = fs.createReadStream(file.path);
                let name = `image/${file.hash}.${ext}`
                this.oss.put(name, reader);
                let url = this.oss.generateObjectUrl(name);
                map.push({ key: file.name.substr(0, file.name.lastIndexOf('.')), url: url });
            }
            ctx.response.body = { map };
        })

        this.router.post("/upload/doc", async (ctx, next) => {
            this.oss.useBucket("base-peng");
            let query = ctx.request.fields;
            let user = query.user;
            let hash = query.hash;
            let headerName = `${user}/header/${hash}.json`;
            let headerBuffer = Buffer.from(query.header);
            await this.oss.put(headerName, headerBuffer);
            let contentName = `${user}/content/${hash}.txt`;
            let contentBuffer = Buffer.from(query.content);
            await this.oss.put(contentName, contentBuffer);
            let htmlName = `${user}/html/${hash}.html`;
            let htmlBuffer = Buffer.from(query.html);
            await this.oss.put(htmlName, htmlBuffer);
            ctx.response.body = { msg: "ok" };
        })

        this.router.post("/doc/list", async (ctx, next) => {
            this.oss.useBucket("base-peng");
            let query = ctx.request.fields;
            let user = query.user;
            let limit = query.limit * 3;
            let creator = query.creator;
            switch (creator) {
                case '*': creator = null; break;
                default: creator = user; break;
            }
            let res = await this.oss.list({
                prefix: creator,
                'max-keys': limit
            }, {});
            let list = {};
            if (res && res.objects) {
                for (let item of res.objects) {
                    let url = this.oss.signatureUrl(item.name, {
                        method: "GET",
                        expires: 36000
                    })
                    let hash = item.name.substring(1 + item.name.lastIndexOf('/'), item.name.lastIndexOf('.'));
                    let ext = item.name.substring(1 + item.name.lastIndexOf('.'));
                    if (!list[hash]) {
                        list[hash] = {};
                    }
                    //获取后缀名
                    switch (ext) {
                        case "json":
                            list[hash].header = url;
                            break;
                        case "txt":
                            list[hash].content = url;
                            break;
                        case "html":
                            list[hash].html = url;
                            break;
                    }
                }
            }

            ctx.response.body = list;
        })
    }

    private getExt(type: string) {
        switch (type) {
            case "image/jpeg": return "jpg";
            case "image/png": return "png";
            default: return "json";
        }
    }
}