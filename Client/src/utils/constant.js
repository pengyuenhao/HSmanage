/**
 * 用户code 换取 session_key
 * @type {String}
 */
export const USER_SPECICAL_INFO = "userSpecialInfo";

/**
 * 用户信息
 * @type {String}
 */
export const USER_INFO = "userInfo";

/**
 * 用户Token
 * @type {String}
 */
export const USER_TOKEN = "userToken";


/**
 * 系统信息
 * @type {String}
 */
export const SYSTEM_INFO = "systemInfo";
/**
 * 位置信息
 */
export const LOCATION_INFO = "locationInfo";

export const REGION_INFO = "regionInfo";

export const ADDRESS_ID = "addressId";

export const SEL_CLASS_CODE = "selClassCode";

/*
* 设置全局数据，登陆信息
*/
export function setGlobal(key, value) {
    wepy.$instance.globalData[key] = value
    return value
}
/*
* 获取全局数据
*/
export function getGlobal(key) {
    return wepy.$instance.globalData[key]
}