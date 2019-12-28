<template>
  <div
    class="animated fadeIn"
    style="margin-top:50px;"
  >
    <span class="title">标题：{{title}}</span>
    <mavon-editor
      ref="md"
      style="margin-top: 50px"
      v-model="content"
      :editable=false
      :toolbarsFlag=false
      :subfield=false
      defaultOpen="preview"
    />
    <Button
      type="primary"
      size="large"
      icon="ios-refresh"
      @click="edit"
      style="margin-top:15px;"
    >重新编辑</Button>
  </div>
</template>

<style scoped>
.expand-row {
  margin-bottom: 16px;
}
</style>
   
<script>
import fetch from "utils/fetch";

export default {
  data() {
    return {
      info:"",
      title: "",
      content: ""
    };
  },
  created() {},
  mounted() {
    this.info = this.$route.query;
    this.title = this.info.title;
    this.getContent(this.info.content);
  },
  methods: {
    async getContent(url) {
      let doc = await fetch({
        url: url,
        method: "get"
      });
      //console.log("[详细]"+url, doc.data);
      this.content = doc.data;
    },
    edit() {
      //console.log("[编辑]");
      this.$router.push({
        path: "/markdown/",
        query: this.info
      });
    }
  }
};
</script>

<style type="less">
.title {
  font-size: 250%;
}
</style>