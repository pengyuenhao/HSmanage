<template>
  <div>
    <div class="flex-c-m" v-show="isShow">
      <qriously
        id="qriously"
        :value="value"
        :size="size"
        :backgroundAlpha="backgroundAlpha"
        v-show="true"
      />
    </div>
    <Spin v-show="!isShow" fix>
      <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
    </Spin>
    <div class="flex-c-l">
      <a :href="imgSrc" download="二维码.jpg">
        <Button type="default" @click="downloadQrcode">导出</Button>
      </a>
    </div>
  </div>
</template>
<script>
export default {
  name: "QrCode",
  props: ["form"],
  data() {
    return {
      download: false,
      downloadFilename: "xxx二维码",
      imgSrc: "",
      isShow: true,
      // 可以自定义，必填项。
      value: "http://lxchuan12.github.io/",
      // 二维码大小 默认 100
      size: 200,
      // 背景透明度，默认透明 0
      backgroundAlpha: 1
    };
  },
  methods: {
    downloadQrcode(event, linkSrc, downloadFilename) {
      let canvas = document.querySelector("#qriously canvas");
      let imgSrc = canvas.toDataURL("image/png");
      this.imgSrc = imgSrc;
      console.log("[生成图片链接]", canvas, imgSrc);

      console.log("[下载]", event, linkSrc, downloadFilename);
    }
  },
  watch: {
    form(n, o) {
      if (n) {
        this.isShow = false;
        this.$store
          .dispatch("CacheRoomData", { id: n.id })
          .then(res => {
            this.value = "" + res.data;
            this.isShow = true;
            console.log(res.data);
          })
          .catch(err => {
            this.isShow = true;
            this.$Message.error(err);
          });
      }
    }
  }
};
</script>

<style>
.demo-spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}
.flex-c-m {
  display: -moz-flex;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  -moz-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  -moz-justify-content: center;
  justify-content: center;
}
.flex-c-l {
  display: -moz-flex;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  -moz-align-items: center;
  align-items: center;
  -webkit-justify-content: flex-end;
  -moz-justify-content: flex-end;
  justify-content: flex-end;
}
</style>
