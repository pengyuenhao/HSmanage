import store from "store/index"

export default {
    getTimer: (overtime, cb, finish) => {
        let that;
        let isOvertime = true;
        let hander = {
            resolve: () => {
                isOvertime = false;
                finish ? finish.call(that) : null;
            }
        }
        setTimeout(() => {
            if (isOvertime) {
                cb ? cb.call(that) : null;
            }
        }, overtime);
        return hander;
    }
}

//Token自动更新
export const TokenAutoUpdate = {
    data() {
        return {
            time: 5*60*60
        }
    },
    methods: {
        update() {
            console.log("[启动Token自动更新插件]");
            this.timer(0);
        },
        timer(time) {
            setTimeout(() => {
                store.dispatch("UpdateToken").then(res => {
                    this.time = 0.3 * res;
                    this.timer(1000 * this.time);
                    console.log("[下次检查Token]" + this.time + "[秒]");
                }).catch(err => {
                    this.time = 5*60*60;
                    this.timer(1000 * this.time);
                    console.log("[更新Token失败]" + err +"[检查时间]" + this.time);
                });
            }, time);

        }
    },
    mounted: function () {
        this.update();
    }
}