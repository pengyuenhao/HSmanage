import { Command, inject } from "peng-ioc";

const RegionId = "cn-hangzhou";
const SignName = "webzzxx48com";
const TemplateCode = "SMS_177550426";
const Indate = 1000 * 60 * 5;
export default class AliSMSVerifyCmd extends Command {
    @inject("sms", "core")
    core: any
    @inject("sms", "map")
    map: Map<string, any>;

    execute(tel, openid, code) {
        let res = this.map.get(tel);
        if (!res) return false;
        //五分钟内有效
        if (res.code == code && res.openid == openid && Date.now() - res.time < Indate) {
            //删除验证码缓存
            this.map.delete(tel);
            return true;
        }
        return false;
    }
}
