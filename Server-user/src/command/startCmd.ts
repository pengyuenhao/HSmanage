import { Command, inject } from "peng-ioc";
import cors from "koa2-cors";
import bodyParser from "koa-bodyparser";

import Koa from "koa";
import Router from "koa-router";

export default class StartCmd extends Command{
    @inject("koa")
    app:Koa<Koa.DefaultState, Koa.DefaultContext>;
    @inject("router")
    router:Router<any, {}>;
    
    execute(){
        this.app.use(cors({
            origin: ctx => '*',
            maxAge: 5,
            credentials: true,
            allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
            exposeHeaders: ['WWW-Authenticate', 'Server-Authorization']
        }))
        this.app.use(bodyParser());
        this.app.use(this.router.routes());
        this.app.listen(8800);
        console.log("[Koa启动完成]")
    }
}