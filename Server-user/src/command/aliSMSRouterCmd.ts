import { Command, inject, NSignalManager, SignalManager } from "peng-ioc";
import Router from "koa-router";
import Koa from "koa";
import AgentMongo from "../utils/agentMongo";

export default class AliSMSRouterCmd extends Command {
    @inject(NSignalManager)
    signalMsg: SignalManager;
    @inject("sms", "map")
    map: Map<string, any>;
    @inject("mongo", "user")
    mongoUser: AgentMongo;
    @inject("router")
    router: Router;
    @inject("crypto", "md5")
    md5: (value: string) => string;
    @inject("jwt", "sign")
    sign: (value: any) => any;

    execute() {
        //请求SMS验证服务
        this.router.post("/sms/send", async (ctx, next) => {
            let { tel, openid } = ctx.request.body as { tel: string, openid: string };
            let status;
            //检查用户是否已经注册过手机号
            let user = await this.mongoUser.get({ openid: openid });
            if (user && user.tel!= null && user.tel != tel) {
                //改用已经注册的手机号进行验证
                tel = user.tel;
                //标记重新绑定
                status = tel.substring(0, 2) + "******" + tel.substring(8);
            } else {
                status = "ok";
            }
            this.signalMsg.get<boolean>("sms_request").dispatch(tel, openid);
            ctx.response.body = {
                status: status
            }
        })
        this.router.post("/sms/verify", async (ctx, next) => {
            let query = ctx.request.body;
            let tel = query.tel;
            let openid = query.openid;
            let code = query.code;
            //验证Code是否正确
            let isVerify = this.signalMsg.get<boolean>("sms_verify").dispatchSole(tel, openid, code);
            //如果验证通过则返回Token
            if (isVerify) {
                //根据openid查找用户数据
                let user = await this.mongoUser.get({ openid: openid });
                let id;
                let password;
                //检查是否为新用户
                if (!user) {
                    //创建随机密码
                    password = this.md5(Math.random().toString());
                    //创建用户
                    let res = await this.mongoUser.set("openid", {
                        tel: tel,
                        openid: openid,
                        password: password,
                        regTime: Date.now()
                    })
                    if(res){
                        id = res.upsertedId._id.toHexString();
                    }
                } else {
                    //如果绑定的手机号与当前不同则更新手机号
                    if (user.tel != tel) {
                        //绑定用户手机号
                        user.tel = tel;
                        let res = await this.mongoUser.set("openid", user);
                    }
                    id = user._id.toHexString();
                    password = user.password;
                }

                //创建Token
                let token = this.sign({
                    id: id,
                    password: password
                });
                ctx.response.body = {
                    status: "ok",
                    token: token
                };
            } else {
                ctx.response.body = {
                    status: "error"
                }
            }
        });
    }
}