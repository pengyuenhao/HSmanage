//IE11路由兼容性修复
export const IE11RouterFix = {
    methods: {
        hashChangeHandler: function () {
            this.$router.push(window.location.hash.substring(1, window.location.hash.length))
        },
        isIE11: function () {
            return !!window.MSInputMethodContext && !!document.documentMode
        }
    },
    mounted: function () {
        if (this.isIE11()) {
            window.addEventListener('hashchange', this.hashChangeHandler)
        }else{
        }
    },
    destroyed: function () {
        if (this.isIE11()) {
            window.removeEventListener('hashchange', this.hashChangeHandler)
        }
    }
}