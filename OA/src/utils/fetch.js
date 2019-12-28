import axios from 'axios';
import store from '../store';
import vue from 'vue';
// import router from '../router';

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 5000                  // 请求超时时间
});
console.log("[Axios实例API地址]" + process.env.BASE_API)

// request拦截器
service.interceptors.request.use(config => {
  // Do something before request is sent
  return config;
}, (error) => {
  // Do something with request error
  //console.log("[拦截错误]", error); // for debug
  window.$Message.error({
    content: error.message,
    duration: 2,
  });
  Promise.reject(error);
})

// respone拦截器
service.interceptors.response.use(
  response => response,
  error => {
    //console.log('err' + error);// for debug
    window.$Message.error({
      content: error.message,
      duration: 2,
    });
    return Promise.reject(error);
  }
)

export default service;
