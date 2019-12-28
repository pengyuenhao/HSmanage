import { Command, inject } from "peng-ioc";

const RegionId = "cn-hangzhou";
const SignName = "webzzxx48com";
const TemplateCode = "SMS_177550426";
const Indate = 1000 * 60 * 5;
export default class AliSMSRequestCmd extends Command {
    @inject("sms", "core")
    core: any
    @inject("sms", "map")
    map: Map<string, any>;

    execute(tel, openid) {
        let code = (10000000 + Math.floor(10000000 * Math.random())).toString().substring(1,7);

        let params = {
            "RegionId": RegionId,
            "PhoneNumbers": tel,
            "SignName": SignName,
            "TemplateCode": TemplateCode,
            "TemplateParam": `{"code":${code}}`
        }
        let requestOption = {
            method: 'POST'
        };
        //请求短信验证码
        this.core.request('SendSms', params, requestOption).then((result) => {
            console.log(JSON.stringify(result));
            //移除无效缓存
            if (this.map.size > 1000) {
                let delKeyArr = [];
                for (let [key, value] of this.map) {
                    if (Date.now() - value.time < Indate) {
                        delKeyArr.push(key);
                    }
                }
                for (let key of delKeyArr) {
                    //删除超时验证
                    this.map.delete(key);
                }
            }
            //短信验证码发送成功设置验证
            this.map.set(tel, {
                time: Date.now(),
                code: code,
                openid: openid
            });
        }, (ex) => {
            console.error(ex);
        })
    }
}