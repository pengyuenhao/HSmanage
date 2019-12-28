import { Context, inject, NSignalManager, SignalManager } from "peng-ioc";
import Koa from "koa";
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
import AliSMSRequestCmd from "../command/aliSMSRequestCmd";
import AliSMSVerifyCmd from "../command/aliSMSVerifyCmd";
import AliSMSRouterCmd from "../command/aliSMSRouterCmd";

import jwt from "jsonwebtoken";
import Core from '@alicloud/pop-core';

/**Token过期时间，单位为秒，默认设置三个月*/
const ExpiresIn = 3 * 30 * 24 * 60 * 60;
/**Token私钥 */
const TokenSecretOrPrivateKey = "HSKJ_TOKEN_USER";
/**阿里云用户ID */
const AccessKeyId = "LTAI4FinKpQjNmb5HnuwFU8v";
/**阿里云用户密钥 */
const AccessKeySecret = "9hHwMmCHs1kPhPYrftgORfRK6w0iwR";
/**阿里云SMS服务终端 */
const SMSEndpoint = "https://dysmsapi.aliyuncs.com";
/**阿里云SMS服务版本 */
const SMSAPIVersion = "2017-05-25";
export default class MainContext extends Context {
    @inject(NSignalManager)
    signalMgr: SignalManager;
    addCore() {
        this.injectBinder.bind("fetch").toValue(async (url: RequestInfo, init?: RequestInit) => {
            let res = await fetch(url, init);
            let json = await res.json();
            return json;
        });
        this.injectBinder.bind("sms").toName("core").toValue(
            new Core({
                accessKeyId: AccessKeyId,
                accessKeySecret: AccessKeySecret,
                endpoint: SMSEndpoint,
                apiVersion: SMSAPIVersion
            })
        )
        this.injectBinder.bind("sms").toName("map").toValue(new Map());
        //验证Token
        this.injectBinder.bind("jwt").toName("verify").toValue(
            (token: string) => {
                //console.log("[验证Token]"+token);
                let result = null;
                jwt.verify(token, TokenSecretOrPrivateKey, (err, decode: any) => {
                    if (err) { console.error(err); return null; }
                    result = decode;
                })
                return result;
            })
        //创建Token
        this.injectBinder.bind("jwt").toName("sign").toValue((value: any, expiresIn: number) => {
            let token = jwt.sign(value, TokenSecretOrPrivateKey, {
                expiresIn: expiresIn?expiresIn:ExpiresIn
            });
            //console.log("[创建Token]"+token);
            return token;
        });
        //更新Token
        this.injectBinder.bind("jwt").toName("update").toValue((value: any, expiresIn: number) => {
            let updateToken = null;
            jwt.verify(value, TokenSecretOrPrivateKey, (err, decode: any) => {
                if (err) {
                    console.log("[Token解析失败]" + err);
                    return;
                }
                let overtime = (Date.now() * 0.001) - decode.time;
                //console.log("[Token超时]" + overtime);
                if (overtime < 0.5 * expiresIn) {
                    //console.log("[Token更新冷却]" + overtime + "/" + (0.5 * expiresIn));
                    updateToken = value;
                    return;
                }
                //更新Token
                updateToken = jwt.sign(
                    //在Token中存储Redis随机Key值
                    { id: decode.id, time: Date.now() * 0.001 },
                    TokenSecretOrPrivateKey,
                    {
                        //过期时间
                        expiresIn: expiresIn
                    });
            });
            return updateToken;
        })
        this.injectBinder.bind("crypto").toName("md5").toValue((value: string) => crypto.MD5(value).toString().toUpperCase());
        this.injectBinder.bind("koa").toValue(new Koa());
        this.injectBinder.bind("router").toValue(new Router());
        super.addCore();
    }
    mapBindings() {
        this.injectBinder.bind("redis").toName("user").toValue(new redis({
            host: "127.0.0.1",
            port: 9001
        }))
        this.injectBinder.bind("redis").toName("data").toValue(new redis({
            host: "127.0.0.1",
            port: 9002
        }))
        this.injectBinder.bind("redis").toName("notice").toValue(new redis({
            host: "127.0.0.1",
            port: 9003
        }))
        this.injectBinder.bind("postgres").toName("data").toValue(new pg({
            user: "postgres",
            database: "postgres",
            password: "password",
            port: 7001,
            max: 20, // 连接池最大连接数
            idleTimeoutMillis: 3000, // 连接最大空闲时间 3s
        }))
        this.injectBinder.bind("mongo").toName("user").toValue(new mongo(
            "mongodb://"
            + "127.0.0.1"
            + ":"
            + 8001, {
            useNewUrlParser: true, useUnifiedTopology: true
        }))
        super.mapBindings();
    }
    postBindings() {
        this.commandBinder.bind("start").to(StartCmd);
        this.commandBinder.bind("router").to(RouterCmd);
        this.commandBinder.bind("test").to(TestCmd);
        this.commandBinder.bind("sms_request").to(AliSMSRequestCmd);
        this.commandBinder.bind("sms_verify").to(AliSMSVerifyCmd);
        this.commandBinder.bind("sms_router").to(AliSMSRouterCmd);

        super.postBindings();
    }
    constructor(root) {
        super(root);
        this.signalMgr.get("router").dispatch();
        this.signalMgr.get("start").dispatch();
        this.signalMgr.get("test").dispatch();
    }
}