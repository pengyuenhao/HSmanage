"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pgutil_1 = __importDefault(require("./utils/pgutil"));
const md5_1 = __importDefault(require("md5"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const koa_sslify_1 = __importDefault(require("koa-sslify"));
const koa_static_1 = __importDefault(require("koa-static"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const index_1 = __importDefault(require("./sql/index"));
const mongouitl_1 = __importDefault(require("./utils/mongouitl"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_1 = __importDefault(require("koa"));
const koa2_cors_1 = __importDefault(require("koa2-cors"));
const koa_better_body_1 = __importDefault(require("koa-better-body"));
const formidable_1 = __importDefault(require("formidable"));
const redis_1 = __importDefault(require("redis"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const form_data_1 = __importDefault(require("form-data"));
/**发送SMS验证码 */
function sendSMS(tel, openid) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = "http://localhost:8800/sms/send";
        let response = yield node_fetch_1.default(url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tel: tel,
                openid: openid
            })
        }).catch(err => console.error(err));
        //确保数据有效
        if (typeof response != "undefined" && response.ok) {
            return yield response.json().catch(err => console.error(err));
        }
        else {
            return null;
        }
    });
}
function verifySMS(tel, openid, code) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = "http://localhost:8800/sms/verify";
        let response = yield node_fetch_1.default(url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tel: tel,
                openid: openid,
                code: code
            })
        }).catch(err => console.error(err));
        //确保数据有效
        if (typeof response != "undefined" && response.ok) {
            return yield response.json().catch(err => console.error(err));
        }
        else {
            return null;
        }
    });
}
/* fetch("http://localhost:8800/find", {
    method: "POST",
    headers: {
        'Authorization': "123",
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: 1 })
}).then(res => console.log(res)).catch(err => console.error(err));
 */
const koa2Req = require('koa2-request');
const app = new koa_1.default();
const router = new koa_router_1.default(); // 实例化路由
const APPID = "wxc19938ca14b8b991";
const SECRET = "dfd51ab5a3117c72acc10ca992f14f93";
const KEY = "192006250b4c09247ec02edce69f6a2d";
/**密钥Key */
//const TokenSecretOrPrivateKey = "HSKJ"
/**异或码 */
const XorCode = 2075296713;
/**Token过期时间，单位为秒，默认设置20分钟*/
const ExpiresIn = 20 * 60 * 60;
const https = require('https');
app.use(koa2_cors_1.default({
    origin: (ctx) => { return '*'; },
    //预检请求的有效期，单位为秒
    maxAge: 5,
    //是否允许发送Cookie
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization']
}));
//app.use(bodyParser());
app.use(koa_better_body_1.default({
    multipart: true,
    urlencoded: true,
    IncomingForm: (() => {
        let form = new formidable_1.default.IncomingForm();
        form.hash = "md5";
        return form;
    })()
}));
/* app.use(body({
    multipart:true,
    urlencoded:true
})) */
//启动前预配置
app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    //ctx.set('Access-Control-Allow-Origin', "*");
    //ctx.set('Access-Control-Allow-Headers', "Access-Control-Allow-Headers,Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    //ctx.set('Access-Control-Allow-Methods', 'OPTIONS,GET,HEAD,PUT,POST,DELETE,PATCH')
    yield next();
}));
//拦截无效请求
app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    //标记所有需要Token验证的请求
    if (ctx.url.startsWith("/token")) {
        let token = ctx.headers.authorization;
        let user = yield GetUserByToken(token);
        if (!user)
            return;
        ctx.user = user;
        ctx.token = token;
    }
    yield next();
}));
app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    //标记所有需要Token验证的请求
    if (ctx.url.startsWith("/app")) {
        let token = ctx.headers.authorization;
        let user = yield GetUserByToken(token);
        if (!user)
            return;
        ctx.user = user;
        ctx.token = token;
    }
    yield next();
}));
const config = JSON.parse(fs_1.default.readFileSync("./config/common.json", "utf8"));
const options = {
    key: fs_1.default.readFileSync('./config/ssl.key'),
    cert: fs_1.default.readFileSync('./config/ssl.pem')
};
app.use(koa_static_1.default(path_1.default.join(__dirname, './static')));
//创建上传文件夹
if (!fs_1.default.existsSync(path_1.default.join(__dirname, './static/upload'))) {
    fs_1.default.mkdirSync(path_1.default.join(__dirname, './static/upload'));
}
pgutil_1.default.getConnection().then(() => {
    pgutil_1.default.select("parking", { "id": "1" }, ["name", "fee"], (res, err) => {
        if (err)
            console.log(err);
        let data = res[0];
        console.log("[停车场]" + data.name + "[费率]" + data.fee);
    });
});
mongouitl_1.default.getConnection().then(() => {
});
var redisClient = redis_1.default.createClient(config.redis.port, config.redis.ip);
redisClient.on('error', function (err) {
    console.log('Error ' + err);
});
//插入测试数据
redisClient.hset("park", "闽V777777", JSON.stringify({
    timein: Date.now() - Math.round(1000000 + 100000000 * Math.random()),
    timeout: Date.now(),
    park: "1234",
    license: "闽V777777",
}), redis_1.default.print);
//插入测试数据
redisClient.hset("park", "闽V888888", JSON.stringify({
    timein: Date.now() - Math.round(100000 + 100000000 * Math.random()),
    timeout: Date.now(),
    park: "1234",
    license: "闽V888888",
}), redis_1.default.print);
//插入测试数据
redisClient.hset("park", "闽V666666", JSON.stringify({
    timein: Date.now() - Math.round(10000000 + 100000000 * Math.random()),
    timeout: Date.now(),
    park: "4567",
    license: "闽V666666",
}), redis_1.default.print);
const UserTokenMap = new Map();
/**
 * 缓存用户Token数据
 */
function CacheUserByToken(token, user) {
    if (user != null) {
        //优先将用户数据存储在内存里
        UserTokenMap.set(token, user);
    }
}
/**
 * 从缓存中获取用户数据
 */
function GetUserByToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        //console.log("[Token验证]", token);
        if (token == "" || token == null)
            return;
        let user = UserTokenMap.get(token);
        let url = "http://localhost:8800/token/user";
        let response = yield node_fetch_1.default(url, {
            method: "POST",
            headers: {
                'Authorization': token,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }).catch(err => console.error(err));
        //确保数据有效
        if (typeof response != "undefined") {
            let res = yield response.json().catch(err => console.error(err));
            if (res) {
                CacheUserByToken(token, res.user);
                return res.user;
            }
            return null;
        }
        else {
            return null;
        }
    });
}
router.get('/', (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.body = "Hello World";
}));
// 登录凭证换取微信服务接口Token
router.get('/wechat/jscode2session', (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let url = "http://localhost:8800/wx/token";
    let response = yield node_fetch_1.default(url, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(ctx.query)
    }).catch(err => console.error(err));
    //确保数据有效
    if (typeof response != "undefined") {
        let res = yield response.json().catch(err => console.error(err));
        if (res) {
            ctx.response.body = res;
        }
        else {
            ctx.response.body = null;
        }
    }
}));
//短信登录验证
router.get("/sms/send", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.query;
    let tel = query.phone;
    let openid = query.openid;
    let res = yield sendSMS(tel, openid);
    ctx.response.body = res;
}));
router.get("/sms/verify", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.query;
    let tel = query.phone;
    let openid = query.openid;
    let code = query.code;
    let token = yield verifySMS(tel, openid, code);
    ctx.response.body = token;
}));
function getExt(type) {
    switch (type) {
        case "image/jpeg": return "jpg";
        default: "json";
    }
}
router.get("/app/wechat/fee", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let params = ctx.query;
    if (params.car_plate_num == "") {
        ctx.response.body = {
            result: false
        };
        return;
    }
    let res = yield new Promise((resolve) => {
        redisClient.hget("park", params.car_plate_num, (err, reply) => {
            if (err || reply == null) {
                //无法获取车牌
                resolve(null);
            }
            else {
                let info = JSON.parse(reply);
                pgutil_1.default.select("parking", { "id": info.park }, ["name", "fee"], (res, err) => {
                    if (err)
                        console.log(err);
                    let data = res[0];
                    if (data != null) {
                        console.log("[停车场]" + data.name + "[费率]" + data.fee);
                        resolve({
                            name: data.name,
                            fee: data.fee,
                            license: info.license,
                            timein: info.timein,
                            timeout: info.timeout
                        });
                    }
                    else {
                        //无法获取停车场信息
                        resolve(null);
                    }
                });
            }
        });
    });
    //返回数据
    ctx.response.body = {
        result: res ? true : false, data: res
    };
}));
router.get("/app/wechat/pay", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let appID = "wx2421b1c4370ec43b";
    let timeStamp = Date.now().toString();
    let noceStr = "e61463f8efa94090b1f366cccfbbb444";
    let packageStr = "prepay_id=u802345jgfjsdfgsdg888";
    let signType = "MD5";
    let stringSign = "appid=" + appID +
        "&timeStamp=" + timeStamp +
        "&noceStr=" + noceStr +
        "&package=" + packageStr +
        "&signType=" + signType +
        "&key=" + KEY;
    let paySign = md5_1.default(stringSign).toUpperCase();
    let hmac = crypto_js_1.default.HmacSHA256(stringSign, KEY).toString().toUpperCase();
    let params = ctx.query;
    crypto_js_1.default.SHA256(stringSign);
    ctx.response.body = {
        appId: appID,
        timeStamp: timeStamp,
        nonceStr: noceStr,
        package: packageStr,
        signType: "MD5",
        paySign: paySign
    };
}));
router.get("/wx/listNotice", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = {
        rlt: true,
        msg: "ok",
        data: [
            {
                "id": 2423,
                "title": "测试公告",
                "date": "2019-05-07",
                "time": "11:46"
            }
        ]
    };
}));
router.get("/wx/getNotice", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = {
        rlt: 'true',
        msg: 'ok',
        data: {
            title: "测试公告内容",
            createDate: "2019-05-07 03:57:58",
            content: [
                {
                    type: "paragraph",
                    content: "这里是测试公告的详细内容。"
                },
                {
                    type: "img",
                    content: "http://dummyimage.com/125x125"
                },
                {
                    type: "paragraph",
                    content: "这里是测试公告的详细内容。"
                },
                {
                    type: "inline",
                    content: "<p>1213</p><button type=&quot;button&quot;>123</button>"
                },
                {
                    type: "any",
                    content: "<p>1213</p><button type=&quot;button&quot;>123</button>"
                },
                {
                    type: "img",
                    content: "http://dummyimage.com/250x250"
                },
            ],
        }
    };
}));
router.get("/wx/listFee", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = { data: [] };
}));
router.get("/wx/listCollectRent", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = { data: [] };
}));
router.get("/wx/listCollectRentH", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = { data: [] };
}));
router.get("/wx/listPropertyFee", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = { data: [] };
}));
router.get("/wx/listPropertyFeeH", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = { data: [] };
}));
router.get("/wx/listWattHour", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = { data: [] };
}));
router.get("/wx/listWattHourH", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = { data: [] };
}));
router.get("/wx/listWaterRecord", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = { data: [] };
}));
router.get("/wx/listWaterRecordH", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = { data: [] };
}));
router.get("/wx/buildingList", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = { data: [] };
}));
router.get("/wx/bindingRoom", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = { data: [] };
}));
router.get("/wx/deleteUserWx", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = { data: [] };
}));
router.get("/wx/listUserWX", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = { data: [] };
}));
router.get("/token/user/list", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.query;
    let user = ctx.user;
    let limitCommunityId = query.community_id ? Number(query.community_id) : null;
    let communityInfoArr = [];
    let blockInfoArr = [];
    let roomInfoArr = [];
    //获取用户拥有的权限的小区
    let communityArr = user.community;
    let queryCommunityArr = [];
    //索引信息
    let communityIndexMap = new Map();
    let communityIdArr = [];
    let queryblockArr = [];
    let communityCache = [];
    //社区数据处理
    for (let community of communityArr) {
        //检查限定了搜索社区的范围
        if (limitCommunityId != null && limitCommunityId != community.id) {
            continue;
        }
        //记录社区索引和权限
        communityIndexMap.set(community.id, communityCache.length);
        communityIdArr.push(community.id);
        communityCache.push({ id: community.id, permission: community.permission });
        //处理区块部分
        if (community.block && community.block.length) {
            let queryBlock = {
                id: community.id,
                block: [],
                index: new Map(),
                cache: [],
                queryRoom: [],
                queryRoomByBlock: [],
            };
            for (let block of community.block) {
                //记录区块索引和权限
                queryBlock.index.set(block.id, queryBlock.block.length);
                queryBlock.block.push(block.id);
                queryBlock.cache.push({ id: block.id, permission: block.permission });
                //处理房间部分
                if (block.room && block.room.length) {
                    let queryRoom = {
                        id: block.id,
                        room: [],
                        index: new Map(),
                        cache: []
                    };
                    for (let room of block.room) {
                        queryRoom.index.set(room.id, queryRoom.room.length);
                        queryRoom.room.push(room.id);
                        queryRoom.cache.push({ id: room.id, permission: room.permission });
                    }
                    queryBlock.queryRoom.push(queryRoom);
                }
                else {
                    if (block.permission > 1) {
                        //没有限制，直接获取全部数据，权限继承自上级
                        queryBlock.queryRoomByBlock.push({ id: block.id, permission: block.permission });
                    }
                }
            }
            queryblockArr.push(queryBlock);
        }
        else {
            if (community.permission > 1) {
                //没有限制，直接获取全部数据，权限继承自上级
                queryCommunityArr.push({ id: community.id, permission: community.permission });
            }
        }
    }
    //社区数据查询
    if (communityIdArr && communityIdArr.length) {
        let communityDataArr = yield pgutil_1.default.query(index_1.default.CommunityData, {
            id: communityIdArr
        }).catch(err => console.error(err));
        for (let community of communityDataArr) {
            let index = communityIndexMap.get(community.id);
            //获取名称数据
            let cache = communityCache[index];
            cache.name = community.name;
            cache.uuid = community.uuid;
            communityInfoArr.push(cache);
        }
    }
    //无限制范围的社区查询
    if (queryCommunityArr && queryCommunityArr.length) {
        let idArr = [];
        let permissionArr = [];
        let indexArr = new Map();
        for (let query of queryCommunityArr) {
            indexArr.set(query.id, idArr.length);
            idArr.push(query.id);
            permissionArr.push(query.permission);
        }
        //无限制范围的区块查询
        let arr = yield pgutil_1.default.query(index_1.default.BlockData, {
            community_id: idArr
        }).catch(err => console.error(err));
        if (arr) {
            for (let item of arr) {
                //获取社区索引
                let index = indexArr.get(item.community_id);
                //继承社区权限
                let permission = permissionArr[index];
                //填充数据
                blockInfoArr.push({
                    id: item.id,
                    permission: permission,
                    name: item.name
                });
            }
        }
        //无限制范围的房间查询
        arr = yield pgutil_1.default.query(index_1.default.RoomData, {
            community_id: idArr
        }).catch(err => console.error(err));
        if (arr) {
            for (let item of arr) {
                //获取社区索引
                let index = indexArr.get(item.community_id);
                //继承社区权限
                let permission = permissionArr[index];
                //填充数据
                roomInfoArr.push({
                    id: item.id,
                    uuid: item.uuid,
                    permission: permission,
                    name: item.name,
                    community_name: item.community_name,
                    block_name: item.block_name,
                    host: item.host,
                    host_name: item.host_name,
                    doorplate: item.doorplate,
                    floor: item.floor,
                    tel: item.tel
                });
            }
        }
    }
    //有限制的区块查询
    if (queryblockArr && queryblockArr.length) {
        //限定范围的区块查询
        for (let queryBlock of queryblockArr) {
            let community_id = queryBlock.id;
            let blockDataArr = yield pgutil_1.default.query(index_1.default.BlockData, {
                id: queryBlock.block,
                community_id: community_id
            }).catch(err => console.error(err));
            for (let block of blockDataArr) {
                let index = queryBlock.index.get(block.id);
                let cache = queryBlock.cache[index];
                cache.name = block.name;
                cache.uuid = block.uuid;
                blockInfoArr.push(cache);
            }
            //限定范围的区块房间查询
            let queryRoomByBlockArr = queryBlock.queryRoomByBlock;
            if (queryRoomByBlockArr && queryRoomByBlockArr.length) {
                let idArr = [];
                let permissionArr = [];
                let indexArr = new Map();
                for (let queryRoomByBlock of queryRoomByBlockArr) {
                    indexArr.set(queryRoomByBlock.id, idArr.length);
                    idArr.push(queryRoomByBlock.id);
                    permissionArr.push(queryRoomByBlock.permission);
                }
                //无限制范围的房间查询
                let arr = yield pgutil_1.default.query(index_1.default.RoomData, {
                    block_id: idArr,
                    community_id: community_id
                }).catch(err => console.error(err));
                if (arr) {
                    for (let item of arr) {
                        //获取社区索引
                        let index = indexArr.get(item.block_id);
                        //继承社区权限
                        let permission = permissionArr[index];
                        //填充数据
                        roomInfoArr.push({
                            id: item.id,
                            uuid: item.uuid,
                            permission: permission,
                            name: item.name,
                            community_name: item.community_name,
                            block_name: item.block_name,
                            host_name: item.host_name,
                            host: item.host,
                            doorplate: item.doorplate,
                            floor: item.floor,
                            tel: item.tel
                        });
                    }
                }
            }
            //限定范围的房间直接查询
            let queryRoomArr = queryBlock.queryRoom;
            if (queryRoomArr && queryRoomArr.length) {
                for (let queryRoom of queryRoomArr) {
                    let roomDataArr = yield pgutil_1.default.query(index_1.default.RoomData, {
                        id: queryRoom.room,
                        community_id: queryBlock.id,
                        block_id: queryRoom.id
                    }).catch(err => console.error(err));
                    for (let room of roomDataArr) {
                        let index = queryRoom.index.get(room.id);
                        let cache = queryRoom.cache[index];
                        cache.host = room.host;
                        cache.doorplate = room.doorplate;
                        cache.floor = room.floor;
                        cache.name = room.name;
                        cache.community_name = room.community_name;
                        cache.block_name = room.block_name;
                        cache.tel = room.tel;
                        cache.uuid = room.uuid;
                        cache.host_name = room.host_name;
                        roomInfoArr.push(cache);
                    }
                }
            }
        }
    }
    let total = roomInfoArr.length;
    //获取返回数据的分页
    if (roomInfoArr && roomInfoArr.length) {
        let limit = Number(query.limit ? query.limit : 10);
        let offset = limit * (Number(query.current ? query.current : 1) - 1);
        //默认从0偏移开始
        let start = offset ? offset : 0;
        //默认限制长度为10
        let end = start + limit;
        //如果偏移的开始位置大于总体数据长度
        if (start > total) {
            roomInfoArr = [];
        }
        if (end > total) {
            end = total;
        }
        roomInfoArr = roomInfoArr.slice(start, end);
    }
    //如果有限定社区则不返回社区数据
    if (limitCommunityId != null) {
        communityInfoArr = null;
    }
    ctx.response.body = {
        community: communityInfoArr,
        block: blockInfoArr,
        room: roomInfoArr,
        total: total
    };
}));
router.get("/token/user/data", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.query;
}));
function UpdateToken(token, ExpiresIn) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = "http://localhost:8800/web/update";
        let response = yield node_fetch_1.default(url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token,
                expiresIn: ExpiresIn
            })
        }).catch(err => console.error(err));
        //确保数据有效
        if (typeof response != "undefined" && response.ok) {
            return yield response.text().catch(err => console.error(err));
        }
        else {
            return null;
        }
    });
}
router.get("/token/update", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.query;
    let token = ctx.headers.authorization;
    let updateToken = yield UpdateToken(token, ExpiresIn);
    if (!updateToken)
        return;
    ctx.response.body = {
        token: updateToken,
        expiresIn: ExpiresIn
    };
}));
router.get("/app/token/update", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.query;
    let token = ctx.headers.authorization;
    let updateToken = yield UpdateToken(token, 10000 * ExpiresIn);
    if (!updateToken)
        return;
    ctx.response.body = {
        token: updateToken,
        expiresIn: ExpiresIn
    };
}));
/**上传图片到数据存储服务 */
function uploadImage(files, user) {
    return __awaiter(this, void 0, void 0, function* () {
        let form = new form_data_1.default();
        form.append("user", user);
        for (let file of files) {
            let data = fs_1.default.createReadStream(file.path);
            form.append("image", data, `${file.name}.${getExt(file.type)}`);
        }
        let url = "http://localhost:8900/upload/image";
        let response = yield node_fetch_1.default(url, {
            method: "POST",
            headers: form.getHeaders(),
            body: form
        }).catch(err => console.error(err));
        //确保数据有效
        if (typeof response != "undefined" && response.ok) {
            return yield response.json().catch(err => console.error(err));
        }
        else {
            return null;
        }
    });
}
router.post("/token/formdata/upload", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let user = ctx.user;
    let query = ctx.request.fields;
    let res = yield uploadImage(query.image, user._id.toString());
    ctx.response.body = res.map;
    return;
    let p = [];
    for (let type in query) {
        let files = query[type];
        for (let file of files) {
            //读取文件缓存
            let reader = fs_1.default.createReadStream(file.path);
            //获取文件扩展名
            let ext = getExt(file.type);
            //获取本地目录
            let localpath = path_1.default.join(__dirname, './static').replace(/\\/g, '/');
            //创建保存路径
            let url = `/upload/${type}.${file.hash}.${ext}`;
            //创建可写流
            let stream = fs_1.default.createWriteStream(localpath + url);
            p.push(new Promise((resolve, reject) => {
                //通过管道写入文件
                reader.pipe(stream).on("finish", () => {
                    resolve({ pos: file.name, url: url });
                });
            }));
        }
    }
    ctx.response.body = yield Promise.all(p);
}));
/**上传图片到数据存储服务 */
function uploadDoc(header, content, html, user) {
    return __awaiter(this, void 0, void 0, function* () {
        let form = new form_data_1.default();
        let data = JSON.stringify(header);
        let hash = crypto_js_1.default.MD5(header.title).toString();
        form.append("user", user);
        form.append("hash", hash);
        form.append("header", data);
        form.append("content", content);
        form.append("html", html);
        let url = "http://localhost:8900/upload/doc";
        let response = yield node_fetch_1.default(url, {
            method: "POST",
            headers: form.getHeaders(),
            body: form
        }).catch(err => console.error(err));
        //确保数据有效
        if (typeof response != "undefined" && response.ok) {
            return yield response.json().catch(err => console.error(err));
        }
        else {
            return null;
        }
    });
}
router.post("/token/doc/upload", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let user = ctx.user;
    let query = ctx.request.fields;
    let content = query.content;
    let header = query.header;
    let image = content.match(/(!\[.+\]\(.+\))?http.+(\.gif|\.jpg|\.png)/g);
    //截取海报
    let poster = image ? image[0] : null;
    //截取前45个字符
    let abstract = content;
    abstract = abstract.replace(/(!\[.+\]\(.+\))/g, '');
    abstract = abstract.replace(/\#.+/, '');
    abstract = abstract.replace(/\#/g, '');
    abstract = abstract.replace(/:::\s+hljs-center/g, '');
    abstract = abstract.replace(/:::\s+hljs-left/g, '');
    abstract = abstract.replace(/:::\s+hljs-right/g, '');
    abstract = abstract.replace(/:::/g, '');
    abstract = abstract.replace(/\^/g, '');
    abstract = abstract.replace(/==/g, '');
    abstract = abstract.replace(/&nbsp;/g, '');
    abstract = abstract.replace(/~/g, '');
    abstract = abstract.replace(/\+\+/g, '');
    abstract = abstract.replace(/\*/g, '');
    abstract = abstract.replace(/\s/g, '');
    abstract = abstract.replace(/\r/g, '');
    abstract = abstract.substr(0, 50);
    header.author = user._id.toString();
    header.name = user.name;
    header.role = user.role;
    header.size = query.html ? query.html.length : 0;
    header.task_status = 1;
    header.poster = poster;
    header.abstract = abstract;
    header.time = Date.now();
    let res = yield uploadDoc(header, query.content, query.html, user._id.toString());
    ctx.response.body = res.map;
    return;
    query.author = user._id.toString();
    query.role = user.role;
    query.time = Date.now();
    let localpath = path_1.default.join(__dirname, './static').replace(/\\/g, '/');
    let url = `/upload/doc.${query.hash}.json`;
    //写入文件
    ctx.response.body = yield new Promise((resolve, reject) => {
        fs_1.default.writeFile(localpath + url, JSON.stringify(query), (err) => {
            if (err)
                reject(err);
            resolve({ msg: "ok" });
        });
    }).catch(err => console.error(err));
}));
function getDocList(limit, offset, user, creator) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = "http://localhost:8900/doc/list";
        let response = yield node_fetch_1.default(url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ limit, offset, user, creator })
        }).catch(err => console.error(err));
        //确保数据有效
        if (typeof response != "undefined" && response.ok) {
            let json = yield response.json().catch(err => console.error(err));
            return json;
        }
        else {
            return null;
        }
    });
}
router.post("/token/doc/list", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.request.fields;
    let creator = query.creator;
    let limit = query.limit;
    let offset = query.offset;
    let user = ctx.user;
    let list = yield getDocList(limit, offset, user._id.toString(), creator);
    if (!list) {
        list = [];
    }
    ctx.response.body = list;
}));
router.get("/app/doc/list", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.request.query;
    let user = ctx.user;
    let creator = query.creator;
    let limit = query.limit;
    let offset = query.offset;
    let res = yield getDocList(limit, offset, user._id.toString(), creator);
    let list = [];
    if (res != null) {
        for (let item in res) {
            let url = res[item].header;
            let html = res[item].html;
            if (!url)
                continue;
            let response = yield node_fetch_1.default(url);
            if (typeof response != "undefined" && response.ok) {
                let header = yield response.json().catch(err => console.error(err));
                header.html = html;
                list.push(header);
            }
        }
    }
    ctx.response.body = list;
}));
router.get("/app/doc/html", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.request.query;
    let user = ctx.user;
    let url = query.url;
    if (url == null) {
        ctx.response.body = null;
        return;
    }
    let response = yield node_fetch_1.default(url, {
        method: "GET",
    }).catch(err => console.error(err));
    if (typeof response != "undefined" && response.ok) {
        let html = yield response.text().catch(err => console.error(err));
        ctx.response.body = html;
    }
    else {
        ctx.response.body = null;
    }
}));
router.get("app/doc/detail", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.request.query;
}));
router.post("/login/loginbyemail", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.request.fields;
    let email = query.email;
    if (email == null || email == "")
        return;
    let url = "http://localhost:8800/web/token";
    let response = yield node_fetch_1.default(url, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
    }).catch(err => console.error(err));
    //确保数据有效
    if (typeof response != "undefined") {
        let res = yield response.json().catch(err => console.error(err));
        if (res && res.token) {
            CacheUserByToken(res.token, res.user);
            //缓存用户Token数据
            ctx.response.body = res.token;
        }
        else {
            ctx.response.body = null;
        }
    }
    else {
        ctx.response.body = null;
    }
}));
router.get("/token/verify", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.query;
    let user = ctx.user;
    console.log("[POST处理]", query);
    ctx.response.body = {
        status: "ok"
    };
}));
router.get("/token/info", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.query;
    let user = ctx.user;
    if (!user)
        return;
    //返回用户信息
    ctx.response.body = {
        role: user.role,
        name: user.name,
        avatar: user.avatar,
        uid: user.uuid,
        introduction: user.introduction
    };
}));
router.post("/token/submit", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.request.fields;
    let user = ctx.user;
    let form = query.form;
    let submit = yield pgutil_1.default.query(index_1.default.SubmitData, { id: form.id }, null, form).catch(err => {
        console.error(err);
    });
    ctx.response.body = submit;
}));
router.get("/token/logout", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.body = {};
}));
router.post("/token/cache", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.request.fields;
    let user = ctx.user;
    let xor = query.id ^ XorCode;
    ctx.response.body = xor;
}));
router.get("/app/wechat/roomData", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.query;
    let room = yield pgutil_1.default.query(index_1.default.RoomData, { id: query.id });
    ctx.response.body = room;
}));
router.get("/app/wechat/roomInfo", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.query;
    let user = ctx.user;
    let code = Number(query.code);
    let xor = code ^ XorCode;
    let room = yield pgutil_1.default.query(index_1.default.RoomData, { id: xor });
    ctx.response.body = room;
}));
router.get("/app/wechat/roomList", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.query;
    let user = ctx.user;
    let id = query.id;
    let openid = query.openid;
    let session = query.session_key;
    let community = user.community;
    //let res = await Mongo.find({ _id: Mongo.ObjectId(id) });
    if (community) {
        let room_id = [];
        let block_id = [];
        let community_id = [];
        for (let community_key in community) {
            community_id.push(community_key);
            for (let block_key in community[community_key].block) {
                block_id.push(block_key);
                for (let room_key in community[community_key].block[block_key].room) {
                    room_id.push(room_key);
                }
            }
        }
        //获取社区名称
        let community_info = yield pgutil_1.default.query(index_1.default.CommunityData, {
            id: community_id
        }, { fields: ["id", "name"] }, null, [Number, String]);
        let block_info = yield pgutil_1.default.query(index_1.default.BlockData, {
            id: block_id
        }, { fields: ["id", "name"] }, null, [Number, String]);
        let room_info = yield pgutil_1.default.query(index_1.default.RoomData, {
            id: room_id
        }, { fields: ["id", "floor", "doorplate"] }, null, [Number, Number, Number]);
        //用户存在可管理的房间
        ctx.response.body = {
            community: user.community,
            community_info: community_info,
            block_info: block_info,
            room_info: room_info
        };
    }
}));
router.get("/app/wechat/roomBind", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let query = ctx.query;
    let user = ctx.user;
    let community_id = query.community_id;
    let block_id = query.block_id;
    let room_id = query.room;
    let data = { community: null };
    data.community = user.community;
    iterationSetField(data, ["community", "block", "room"], [community_id, block_id, room_id], () => {
        return {
            //权限默认设为1，可查看基本信息
            permission: 1,
            //类型设为0，仅包含具体指示的内容
            type: 0
        };
    });
    let url = "http://localhost:8800/token/update";
    let response = yield node_fetch_1.default(url, {
        method: "POST",
        headers: {
            'Authorization': ctx.token,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).catch(err => console.error(err));
    if (response) {
        ctx.response.body = response.status;
    }
    else {
        ctx.response.body = null;
    }
}));
/**迭代设置值 */
function iterationSetField(value, fields, ids, defalut) {
    if (!fields.length)
        return value;
    let field = fields.shift();
    let id = ids.shift();
    if (!value[field]) {
        value[field] = {};
    }
    if (!value[field][id]) {
        value[field][id] = defalut();
    }
    iterationSetField(value[field][id], fields, ids, defalut);
}
router.get("/");
//app.use(bodyParser());
app.use(router.routes());
// Force HTTPS on all page
if (config.https == true) {
    app.use(koa_sslify_1.default());
    https.createServer(options, app.callback()).listen(config.port, () => {
        // const host = server.address().address
        const host = "localhost";
        const port = config.port;
        console.log(`应用实例，访问地址为 https://${host}:${port}`);
    });
}
else {
    app.listen(config.port);
    const host = "localhost";
    const port = config.port;
    console.log(`应用实例，访问地址为 http://${host}:${port}`);
}
//app.listen(8000);
console.log("[服务器启动监听]" + config.port);
//# sourceMappingURL=index.js.map