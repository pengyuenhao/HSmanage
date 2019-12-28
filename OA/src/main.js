import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import * as fix from 'utils/fix';
import {TokenAutoUpdate} from 'utils/timer';
import './mock/index.js';  // 该项目所有请求使用mockjs模拟
import './login.js' 
import './ui.js' 
import 'utils/message'
import 'utils/qriously'
import 'utils/md5'
import 'utils/mavon'
Vue.config.productionTip = false;
var vm=new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
  mixins: [fix.IE11RouterFix,TokenAutoUpdate]
})