import {
  wxRequest,urlRequest
} from '@/utils/wxRequest';

//const apiHost = 'http://localhost:8000';
const apiHost = 'https://www.zzxx48.com';
const apiUrl = '/app';
const request = (url,method,header,params) => urlRequest(url,method,header,params);
const updateToken = (params) => wxRequest(params, apiHost + apiUrl + '/token/update');
const getDocHTML = (params) => wxRequest(params, apiHost + apiUrl + '/doc/html');
const getDocList = (params) => wxRequest(params, apiHost + apiUrl + '/doc/list');
/**
 * 获取发现好商品接口
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
const submitBindApply = (params) => wxRequest(params, apiHost + apiUrl + '/wechat/roomBind');
const getHostRoomList = (params) => wxRequest(params, apiHost + apiUrl + '/wechat/roomList');
const getRoomData = (params) => wxRequest(params, apiHost + apiUrl + '/wechat/roomData');
const getRoomInfo = (params) => wxRequest(params, apiHost + apiUrl + '/wechat/roomInfo');
const getDiscoverList = (params) => wxRequest(params, apiHost + '/emall/goods/list?cateidOne=1&cateidTwo=0&price=0&sales=2');
const inquiryFee = (params) => wxRequest(params, apiHost + apiUrl + '/wechat/fee');
const getPayJsConfig = (params) => wxRequest(params, apiHost + apiUrl + '/wechat/pay');
//微信的jscode换取sessionKey
const wxJsCode2Session = (params) => wxRequest(params, apiHost + "/wechat/jscode2session");
const user2session = (params) => wxRequest(params, apiHost + "/emall/api/wechat/user2session?jsoncallback=?");

//商品接口---begin
//首页发现商品接口
const hostGoodsList = (params) => wxRequest(params, apiHost + '/emall/api/home/hostGoodsList');
const getHomeDisvocerList = (params) => wxRequest(params, apiHost + '/emall/api/mall/discoverList');
//查询商品列表
const getGoodsList = (params) => wxRequest(params, apiHost + '/emall/api/mall/searchGoodsList');

//查询商品详情信息
const goodsDetail = (params) => wxRequest(params, apiHost + '/emall/api/mall/goods');
//商品加入购物车
const addCart = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsCart/add');
//用户的购物车商品列表
const cartList = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsCart/list');
//购物车的商品选中状态
const cartCheck = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsCart/check');
//购物车的商品选中状态(全选)
const cartCheckAll = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsCart/checkAll');
//购物车的商品删除
const cartDel = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsCart/delete');
//购物车的商品数量更新
const cartUpdateNum = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsCart/updateNum');
//直接购买商品
const preOrder = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsOrder/commitData');

//支付前生成订单
const saveByCart = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsOrder/saveByCart');

//支付统一下单
const toPay = (params) => wxRequest(params, apiHost + '/emall/wepay/toPay');

//商品收藏
const goodsFavorite = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsFavorite/add');

//商品收藏删除
const goodsUnFavorite = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsFavorite/delete');

//商品是否已收藏
const goodsIsFavorite = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsFavorite/goodsIsFavorite');

//商品接口---end

//用户相关信息--begin
//用户的当天签到信息
const userSginInfo = (params) => wxRequest(params, apiHost + '/emall/api/userSign/signInfo');
const doSign = (params) => wxRequest(params, apiHost + '/emall/api/userSign/doSign');
//获取最近七天签到情况
const getSignDate = (params) => wxRequest(params, apiHost + '/emall/api/userSign/getSignDate');

//用户积分信息
const pointInfo = (params) => wxRequest(params, apiHost + '/emall/api/userPoint/pointInfo');

//用户足迹信息
const browseInfo = (params) => wxRequest(params, apiHost + '/emall/api/userBrowse/browseInfo');
//添加用户足迹
const addBrowser = (params) => wxRequest(params, apiHost + '/emall/api/userBrowse/add');
//添加用户足迹
const delUserBrowser = (params) => wxRequest(params, apiHost + '/emall/api/userBrowse/delete');

//用户收藏的商品
const favoriteInfo = (params) => wxRequest(params, apiHost + '/emall/api/goodsFavorite/favoriteInfo');

//用户消息
const messageInfo = (params) => wxRequest(params, apiHost + '/emall/api/systemMessage/messageInfo');

//用户手机绑定
const registerUser = (params) => wxRequest(params, apiHost + '/sms/verify');
//发送短信
const sendRandCode = (params) => wxRequest(params, apiHost + '/sms/send');

//用户是否绑定手机号
const getUserInfo = (params) => wxRequest(params, apiHost + '/emall/api/userCenter/getUserInfo');

//用户收货地址
const getUserAddress = (params) => wxRequest(params, apiHost + '/emall/api/receiverInfo/list');

//保存用户收货地址
const saveAddress = (params) => wxRequest(params, apiHost + '/emall/api/receiverInfo/saveOrUpdate');

//用户收货地址根据id查询
const receiverInfoById = (params) => wxRequest(params, apiHost + '/emall/api/receiverInfo/receiverInfoById');

//根据Id删除收货地址
const delUserAddress = (params) => wxRequest(params, apiHost + '/emall/api/receiverInfo/operation');

//查询关键字保存
const addSearchKeyword = (params) => wxRequest(params, apiHost + '/emall/api/searchkeyword/add');
//查询关键字列表
const searchKeywordList = (params) => wxRequest(params, apiHost + '/emall/api/searchkeyword/list');
//查询关键字清除
const clearSearchKeyword = (params) => wxRequest(params, apiHost + '/emall/api/searchkeyword/clear');

//查询我的订单
const getMyOrderList = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsOrder/getMyOrderList');

//查询我的订单数量
const getMyOrderSize = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsOrder/getMyOrderSize');

//根据订单号查询详情
const getOrderInfo = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsOrder/getOrderDetail');

//根据订单号查询详情
const getPayOrderDetail = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsOrder/getPayOrderDetail');

//根据订单号查询详情
const editOrderInfo = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsOrder/opt');

//根据订单号查询物流
const orderExpressInfo = (params) => wxRequest(params, apiHost + '/emall/api/orderExpress/orderExpressInfo');

//查询用户的已订购产品
const goodsUserOrderList = (params) => wxRequest(params, apiHost + '/emall/api/mall/goodsOrder/goodsUserOrderList');

//退货操作
const refundApply = (params) => wxRequest(params, apiHost + '/emall/api/mall/refund/saveRefundApply');

//用户相关信息--end

//商品分类--begin
//一级分类
const rootCtegoryList = (params) => wxRequest(params, apiHost + '/emall/api/mall/rootCtegoryList');
//二级三级分类
const childGoodsCatetoryList = (params) => wxRequest(params, apiHost + '/emall/api/mall/childGoodsCatetoryList');
//商品分类--end

//查询广告列表
const getAdList = (params) => wxRequest(params, apiHost + '/emall/api/adverts/list');

export default {
  request,
  getDocList,
  submitBindApply,
  getHostRoomList,
  getRoomData,
  getRoomInfo,
  getPayJsConfig,
  inquiryFee,
  hostGoodsList,
  getDiscoverList,
  getHomeDisvocerList,
  getGoodsList,
  goodsDetail,
  wxJsCode2Session,
  user2session,
  userSginInfo,
  doSign,
  addCart,
  cartList,
  cartCheck,
  cartCheckAll,
  cartDel,
  cartUpdateNum,
  preOrder,
  refundApply,
  pointInfo,
  browseInfo,
  addBrowser,
  delUserBrowser,
  favoriteInfo,
  messageInfo,
  registerUser,
  sendRandCode,
  getUserInfo,
  getUserAddress,
  saveAddress,
  receiverInfoById,
  getUserAddress,
  addSearchKeyword,
  searchKeywordList,
  clearSearchKeyword,
  getMyOrderList,
  saveByCart,
  toPay,
  rootCtegoryList,
  childGoodsCatetoryList,
  getOrderInfo,
  editOrderInfo,
  goodsUserOrderList,
  orderExpressInfo,
  delUserAddress,
  goodsFavorite,
  goodsUnFavorite,
  goodsIsFavorite,
  getMyOrderSize,
  getPayOrderDetail,
  getAdList,
  getSignDate,
  getDocHTML,
  updateToken
}
