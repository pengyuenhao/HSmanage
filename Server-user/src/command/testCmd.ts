import { Command, inject } from "peng-ioc";

import SQL from "../utils/sql2PG";

import AgentRedis from "../utils/agentRedis";
import AgentPG from "../utils/agentPG";
import AgentMongo from "../utils/agentMongo";


const user_manager_0 =
{
    //全局UUID唯一识别号
    uuid: "85b442a6-67cb-4c08-bc2b-396a53608811",
    //账户Email
    email: "admin@wz.com",
    //账户关联手机号
    tel: "123456789",
    //用户登录名
    login: "admin",
    //用户头像
    avatar: "",
    //名称
    name: "manager",
    //权限组
    role: ["admin"],
    //用户描述
    introduction: "超级管理员账号",
    //账户
    account: {
        //历史记录
        history: []
    },
    //设置密码，使用MD5码存储
    password: "E10ADC3949BA59ABBE56E057F20F883E",
    //社区权限
    community: [{
        id: 1,
        permission: 6
    }, {
        id: 2,
        permission: 5,
        //设置小区权限
        block: [{
            id: 3,
            permission: 4,
            //设置房屋权限
            room: [{
                id: 4,
                permission: 2
            }]
        }, {
            id: 5,
            permission: 3
        }]
    }, {
        id: 6,
        permission: 3,
        block: [{
            id: 4,
            permission: 3
        }]
    }],
    upper: 0,
    //设置代理
    agency: [{
        id: 2,
    }]
};
const user_manager_1 = {
    //全局UUID唯一识别号
    uuid: "0a32d2a2-3411-4a0c-a521-0cb2cf488474",
    //设置名称
    name: "agency_0",
    email: "manager1@wz.com",
    //设置密码，使用MD5码存储
    password: "E10ADC3949BA59ABBE56E057F20F883E",
    upper: 1,
    community: [{
        id: 0,
        permission: 1,
        //设置代理管理的小区
        block: [{
            id: 0,
            permission: 3
        }]
    }]
}
const user_manager_2 = {
    //全局UUID唯一识别号
    uuid: "e405f912-1aca-4de3-82d5-a90ce22567c8",
    //设置名称
    email: "manager2@wz.com",
    name: "agency_1",
    //设置密码，使用MD5码存储
    password: "E10ADC3949BA59ABBE56E057F20F883E",
    upper: 1,
    community: [{
        id: 1,
        permission: 2,
    }]
}
export default class TestCmd extends Command {
    @inject("redis", "user")
    redisUser: AgentRedis;
    @inject("redis", "data")
    redisData: AgentRedis;
    @inject("redis", "notice")
    redisNotice: AgentRedis;
    @inject("postgres", "data")
    postgresData: AgentPG;
    @inject("mongo", "user")
    mongoUser: AgentMongo;

    execute() {
        this.test();
    }
    private async test() {
        //let s1 = await this.redisUser.set(0, 1);
        //let s2 = await this.redisData.set(0, 2);
        //let s3 = await this.redisNotice.set(0, 3);
        //let s4 = await this.mongoUser.set("id", { id: 4 });
        //let r1 = await this.redisUser.get(0);
        //let r2 = await this.redisData.get(0);
        //let r3 = await this.redisNotice.get(0);
        //let r4 = await this.mongoUser.get({ id: 4 });
        //let r5 = await this.postgresData.query(SQL.TableInfo, { table_schema: "public", table_name: "data" });

        await this.mongoUser.set("email", user_manager_0);
        await this.mongoUser.set("email", user_manager_1);
        await this.mongoUser.set("email", user_manager_2);
        //console.log(r1, r2, r3, r4, r5);
    }
}