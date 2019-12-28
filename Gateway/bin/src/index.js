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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pgutil_1 = __importDefault(require("./utils/pgutil"));
var md5_1 = __importDefault(require("md5"));
var crypto_js_1 = __importDefault(require("crypto-js"));
var koa_sslify_1 = __importDefault(require("koa-sslify"));
var koa_static_1 = __importDefault(require("koa-static"));
var fs_1 = __importDefault(require("fs"));
var Koa = require('koa');
var Router = require('koa-router'); // koa 路由中间件
var koa2Req = require('koa2-request');
var bodyParser = require('koa-bodyparser'); // 处理post请求
var redis = require('redis');
var app = new Koa();
var router = new Router(); // 实例化路由
var APPID = "wxc19938ca14b8b991";
var SECRET = "dfd51ab5a3117c72acc10ca992f14f93";
var KEY = "192006250b4c09247ec02edce69f6a2d";
var https = require('https');
app.use(koa_static_1.default(__dirname + '/static'));
// Force HTTPS on all page
app.use(koa_sslify_1.default());
var config = JSON.parse(fs_1.default.readFileSync("./config/common.json", "utf8"));
var options = {
    key: fs_1.default.readFileSync('./config/ssl.key'),
    cert: fs_1.default.readFileSync('./config/ssl.pem')
};
pgutil_1.default.getConnection().then(function () {
    pgutil_1.default.select("parking", { "id": "1234" }, ["name", "fee"], function (res, err) {
        if (err)
            console.log(err);
        var data = res[0];
        console.log("[停车场]" + data.name + "[费率]" + data.fee);
    });
});
var redisClient = redis.createClient(config.redis.port, config.redis.ip);
redisClient.on('error', function (err) {
    console.log('Error ' + err);
});
//插入测试数据
redisClient.hset("park", "闽V777777", JSON.stringify({
    timein: Date.now() - Math.round(1000000 + 100000000 * Math.random()),
    timeout: Date.now(),
    park: "1234",
    license: "闽V777777",
}), redis.print);
//插入测试数据
redisClient.hset("park", "闽V888888", JSON.stringify({
    timein: Date.now() - Math.round(100000 + 100000000 * Math.random()),
    timeout: Date.now(),
    park: "1234",
    license: "闽V888888",
}), redis.print);
//插入测试数据
redisClient.hset("park", "闽V666666", JSON.stringify({
    timein: Date.now() - Math.round(10000000 + 100000000 * Math.random()),
    timeout: Date.now(),
    park: "4567",
    license: "闽V666666",
}), redis.print);
router.get('/', function (ctx, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        ctx.body = "Hello World";
        return [2 /*return*/];
    });
}); });
// 添加url
router.get('/app/wechat/jscode2session', function (ctx, next) { return __awaiter(void 0, void 0, void 0, function () {
    var params, url, res, _a, session_key, openid;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                params = ctx.query;
                url = 'https://api.weixin.qq.com/sns/jscode2session?appid='
                    + APPID + '&secret='
                    + SECRET + '&js_code='
                    + params.jsCode + '&grant_type=authorization_code';
                return [4 /*yield*/, koa2Req(url)];
            case 1:
                res = _b.sent();
                _a = JSON.parse(res.body), session_key = _a.session_key, openid = _a.openid;
                ctx.response.body = { result: true, data: { session_key: session_key, openid: openid } };
                return [2 /*return*/];
        }
    });
}); });
router.get("/app/wechat/fee", function (ctx, next) { return __awaiter(void 0, void 0, void 0, function () {
    var params, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                params = ctx.query;
                if (params.car_plate_num == "") {
                    ctx.response.body = {
                        result: false
                    };
                    return [2 /*return*/];
                }
                return [4 /*yield*/, new Promise(function (resolve) {
                        redisClient.hget("park", params.car_plate_num, function (err, reply) {
                            if (err || reply == null) {
                                //无法获取车牌
                                resolve(null);
                            }
                            else {
                                var info_1 = JSON.parse(reply);
                                pgutil_1.default.select("parking", { "id": info_1.park }, ["name", "fee"], function (res, err) {
                                    if (err)
                                        console.log(err);
                                    var data = res[0];
                                    if (data != null) {
                                        console.log("[停车场]" + data.name + "[费率]" + data.fee);
                                        resolve({
                                            name: data.name,
                                            fee: data.fee,
                                            license: info_1.license,
                                            timein: info_1.timein,
                                            timeout: info_1.timeout
                                        });
                                    }
                                    else {
                                        //无法获取停车场信息
                                        resolve(null);
                                    }
                                });
                            }
                        });
                    })];
            case 1:
                res = _a.sent();
                //返回数据
                ctx.response.body = {
                    result: res ? true : false, data: res
                };
                return [2 /*return*/];
        }
    });
}); });
router.get("/app/wechat/pay", function (ctx, next) { return __awaiter(void 0, void 0, void 0, function () {
    var appID, timeStamp, noceStr, packageStr, signType, stringSign, paySign, hmac, params;
    return __generator(this, function (_a) {
        appID = "wx2421b1c4370ec43b";
        timeStamp = Date.now().toString();
        noceStr = "e61463f8efa94090b1f366cccfbbb444";
        packageStr = "prepay_id=u802345jgfjsdfgsdg888";
        signType = "MD5";
        stringSign = "appid=" + appID +
            "&timeStamp=" + timeStamp +
            "&noceStr=" + noceStr +
            "&package=" + packageStr +
            "&signType=" + signType +
            "&key=" + KEY;
        paySign = md5_1.default(stringSign).toUpperCase();
        hmac = crypto_js_1.default.HmacSHA256(stringSign, KEY).toString().toUpperCase();
        params = ctx.query;
        crypto_js_1.default.SHA256(stringSign);
        ctx.response.body = {
            appId: appID,
            timeStamp: timeStamp,
            nonceStr: noceStr,
            package: packageStr,
            signType: "MD5",
            paySign: paySign
        };
        return [2 /*return*/];
    });
}); });
app.use(bodyParser());
app.use(router.routes());
https.createServer(options, app.callback()).listen(config.port, function () {
    // const host = server.address().address
    var host = "localhost";
    var port = config.port;
    console.log("\u5E94\u7528\u5B9E\u4F8B\uFF0C\u8BBF\u95EE\u5730\u5740\u4E3A https://" + host + ":" + port);
});
//app.listen(8000);
console.log("[服务器启动监听]" + config.port);
//# sourceMappingURL=index.js.map