import { Context, inject, NSignalManager, SignalManager } from "peng-ioc";
import Koa from "koa";
import BetterBody from "koa-better-body";
import Formidable from "formidable";
import cors from "koa2-cors";

import Router from "koa-router";
import crypto from "crypto-js";
import redis from "../utils/agentRedis";
import mongo from "../utils/agentMongo";
import pg from "../utils/agentPG";
import fetch, { RequestInfo, RequestInit } from "node-fetch";

import fs from "fs";
import StartCmd from "../command/startCmd";
import TestCmd from "../command/testCmd";
import RouterCmd from "../command/routerCmd";
import AliOSSUploadCmd from "../command/aliOSSUploadCmd";
import AliOSSRouterCmd from "../command/aliOSSRouterCmd";

import jwt from "jsonwebtoken";
import OSS from 'ali-oss';

/**Token过期时间，单位为秒，默认设置三个月*/
const ExpiresIn = 3 * 30 * 24 * 60 * 60;
/**Token私钥 */
const TokenSecretOrPrivateKey = "HSKJ_TOKEN_USER";
/**阿里云用户ID */
const AccessKeyId = "LTAI4FinKpQjNmb5HnuwFU8v";
/**阿里云用户密钥 */
const AccessKeySecret = "9hHwMmCHs1kPhPYrftgORfRK6w0iwR";

const AliRegion = "oss-cn-beijing";
const AliBucket = "base-peng";
const AliEndpoint = "oss-cn-beijing.aliyuncs.com";
export default class MainContext extends Context {
    @inject(NSignalManager)
    signalMgr: SignalManager;
    addCore() {
        this.injectBinder.bind("fs").toValue(fs);
        this.injectBinder.bind("fetch").toValue(async (url: RequestInfo, init?: RequestInit) => {
            let res = await fetch(url, init);
            let json = await res.json();
            return json;
        });
        this.injectBinder.bind("oss").toName("client").toValue(
            new OSS({
                accessKeyId: AccessKeyId,
                accessKeySecret: AccessKeySecret,
                endpoint: AliEndpoint,
                region: AliRegion,
                bucket: AliBucket
            })
        )
        this.injectBinder.bind("oss").toName("map").toValue(new Map());
        //验证Token
        this.injectBinder.bind("jwt").toName("verify").toValue(
            (token: string) => {
                jwt.verify(token, TokenSecretOrPrivateKey, (err, decode: any) => {
                    if (err) { console.error(err); return null; }
                    return decode;
                })
            })
        //创建Token
        this.injectBinder.bind("jwt").toName("sign").toValue((value: any) => {
            return jwt.sign(value, TokenSecretOrPrivateKey, {
                expiresIn: ExpiresIn
            })
        });
        this.injectBinder.bind("crypto").toName("md5").toValue((value: string) => crypto.MD5(value).toString().toUpperCase());
        this.injectBinder.bind("koa").toValue((() => {
            let app = new Koa();
            app.use(cors({
                origin: (ctx) => { return '*' },
                //预检请求的有效期，单位为秒
                maxAge: 5,
                //是否允许发送Cookie
                credentials: true,
                allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
                exposeHeaders: ['WWW-Authenticate', 'Server-Authorization']
            }));
            app.use(BetterBody({
                multipart: true,
                urlencoded: true,
                IncomingForm: (() => {
                    let form = new Formidable.IncomingForm();
                    form.hash = "md5";
                    return form
                })()
            }))
            return app;
        })());
        this.injectBinder.bind("router").toValue(new Router());
        super.addCore();
    }
    mapBindings() {
        this.injectBinder.bind("redis").toName("notice").toValue(new redis({
            host: "127.0.0.1",
            port: 9003
        }))
        super.mapBindings();
    }
    postBindings() {
        this.commandBinder.bind("start").to(StartCmd);
        this.commandBinder.bind("router").to(RouterCmd);
        this.commandBinder.bind("test").to(TestCmd);
        this.commandBinder.bind("oss/upload").to(AliOSSUploadCmd);
        this.commandBinder.bind("oss/router").to(AliOSSRouterCmd);

        super.postBindings();
    }
    constructor(root) {
        super(root);
        this.signalMgr.get("router").dispatch();
        this.signalMgr.get("start").dispatch();
        this.signalMgr.get("test").dispatch();
    }
}