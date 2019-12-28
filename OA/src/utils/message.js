import Vue from 'vue';
import VueMessage from "vue-messages"
Vue.use(VueMessage, {
    content: '',
    duration: 1, // unit: s
    themes: 'blackGold', // classic or classicBold
    styles: {
        top: 24, // unit: px
        fontWeight: 'normal', // normal or bold
        fontSize: 28
    },
    before() {
        //console.log('custom before hook')
    },
    done() {
        //console.log('custom done hook')
    },
})
console.log("[载入消息插件]"+(window.$Message?true:false));