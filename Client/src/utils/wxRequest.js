import wepy from 'wepy';
import util from './util';
import md5 from './md5';
import tip from './tip'
import { USER_TOKEN } from "@/utils/constant";

const API_SECRET_KEY = 'localhost'
const TIMESTAMP = util.getCurrentTime()
const SIGN = md5.hex_md5((TIMESTAMP + API_SECRET_KEY).toLowerCase())
/**封装微信请求接口 */
const wxRequest = async (params = {}, url) => {
    let isLoading = false;
    let isAlert = true;
    let data = params.query || {};
    data.sign = SIGN;
    data.time = TIMESTAMP;
    let token = wepy.getStorageSync(USER_TOKEN);

    console.log("[请求服务端]" + (params.method || 'GET'), url, data, "[用户TOKEN]", token);
    //设置500毫秒等待
    setTimeout(() => {
        //如果超过500毫秒服务器未响应则弹出等待提示框
        if (isAlert) {
            isLoading = true;
            //弹出加载提示
            tip.loading();
        }
    }, 500);

    let res = await wepy.request({
        url: url,
        method: params.method || 'GET',
        data: data,
        header: {
            'Authorization': token,
            'Content-Type': 'application/json'
        },
    }).catch((err) => {
        console.log("[服务端错误]", err);
    });

    if (isLoading) {
        //载入完成
        tip.loaded();
    }
    isAlert = false;
    console.log("[服务端回复]", res);
    return res;
};
const urlRequest = async (url,method,header,params)=>{
    let isLoading = false;
    let isAlert = true;
    console.log("[请求服务端]" + (method || 'GET'), url);
    //设置500毫秒等待
    setTimeout(() => {
        //如果超过500毫秒服务器未响应则弹出等待提示框
        if (isAlert) {
            isLoading = true;
            //弹出加载提示
            tip.loading();
        }
    }, 500);
    let res = await wepy.request({
        url: url,
        method: method || 'GET',
        //data: params,
        header: header || {'Content-Type': 'application/json'}
    }).catch((err) => {
        console.log("[服务端错误]", err);
    });
    if (isLoading) {
        //载入完成
        tip.loaded();
    }
    isAlert = false;
    console.log("[服务端回复]", res);
    return res;
}

module.exports = {
    wxRequest,
    urlRequest
}
