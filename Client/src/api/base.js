/*
* 公用配置
* 2018-07-12
* END
*/
import wepy from 'wepy'
import wxRequest from "@/utils/wxRequest"

export default class Base {
  static baseUrl = wepy.$instance.globalData.baseUrl
  /*
  * 设置全局数据，登陆信息
  */
  static async setConfig (key, value) {
    await wepy.setStorage({key: key, data: value})
    wepy.$instance.globalData[key] = value
    return value
  }
  /*
  * 获取全局数据
  */
  static getConfig (key) {
    return wepy.$instance.globalData[key]
  }
  static get(url,params){
    if(params != null){
      params.method = params.method || 'GET';
    }
    return wxRequest(params,url);
  }
  static post(url,params){
    if(params != null){
      params.method = params.method || 'POST';
    }
    return wxRequest(params,url);
  }
}
