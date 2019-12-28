import { Command, inject, NSignalManager, SignalManager } from "peng-ioc";
import Router from "koa-router";
import Koa from "koa";
import AgentMongo from "../utils/agentMongo";

const APPID = "wxc19938ca14b8b991";
const SECRET = "dfd51ab5a3117c72acc10ca992f14f93";

export default class RouterCmd extends Command {
    @inject(NSignalManager)
    signalMsg: SignalManager;
    @inject("router")
    router: Router;
    @inject("koa")
    koa: Koa;
    @inject("mongo", "user")
    mongoUser: AgentMongo;

    @inject("crypto", "md5")
    md5: (value: string) => string;
    @inject("jwt", "verify")
    verify: (value: string) => any;
    @inject("jwt", "sign")
    sign: (value: any) => any;
    @inject("fetch")
    fetch:Function;

    @inject("sms", "map")
    map: Map<string, any>;

    execute() {
        //拦截无效请求
        this.koa.use(async (ctx, next) => {
            //标记所有需要Token验证的请求
            if (ctx.url.startsWith("/token")) {
                let token = ctx.headers.authorization;
                let decode = this.verify(token);
                if (!decode) return;
                let user = await this.mongoUser.get({ id: decode.id }).catch(err => console.error(err));
                if (!user) return;
                ctx.user = user;
            }
            await next();
        })
        //注册SMS路由
        this.signalMsg.get("oss/router").dispatch();
        this.router.post("/wxtoken", async (ctx, next) => {
            let params = ctx.request.body;
            // 组合url
            let code2Session_url =
                'https://api.weixin.qq.com/sns/jscode2session?appid='
                + APPID + '&secret='
                + SECRET + '&js_code='
                + params.jsCode + '&grant_type=authorization_code';
            // 向微信服务器发送请求
            let access_token_url =
                'https://api.weixin.qq.com/cgi-bin/token?appid='
                + APPID + '&secret='
                + SECRET + '&grant_type=client_credential';
            let { session_key, openid } = await this.fetch(code2Session_url);
            let { access_token, expires_in, errcode, errmsg } = await this.fetch(access_token_url);
            let user = await this.mongoUser.get({ openid: openid });
            let id;
            if (!user) {
                let res = await this.mongoUser.set("openid", {
                    openid:openid,
                    name: params.nickName,
                    role: ["user"],
                    introduction: "没有描述",
                })
                id = res.upsertedId._id.toHexString();
            }else{
                id = user._id.toHexString();
            }
            ctx.response.body = {
                session_key,
                openid,
                id,
            };
        })
        //查询数据
        this.router.post("/find", async (ctx, next) => {
            let data = ctx.request.body;
            let token = ctx.headers.authorization;
            let id = data.id;
            //尝试获取用户信息
            let user = await this.mongoUser.get({ id: id }).catch(err => console.log(err));
        })
        //获取快照
        this.router.get("/snapshoot", async (ctx, next) => {
            let query = ctx.query;
            let id = query.id;
        })
        //创建数据
        this.router.get("/create", async (ctx, next) => {

        })
        //更新数据
        this.router.get("/update", async (ctx, next) => {

        })
        //删除数据
        this.router.get("/delete", async (ctx, next) => {

        })
    }
}