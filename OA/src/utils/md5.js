import Vue from 'vue';
import md5 from "js-md5";

Vue.prototype.$md5 = md5;

console.log("[载入MD5插件]");