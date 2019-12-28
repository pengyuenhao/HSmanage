<template>
  <div class="components-container">
    <h3 class="intro-head">文本编辑器</h3>
    <mavon-editor
      ref="md"
      style="margin-top: 50px"
      v-model="content"
      @save="onSave"
      @imgAdd="imgAdd"
      @imgDel="imgDel"
    />
    <Drawer
      v-model="showSubmit"
      width="100"
      title="上传并保存到服务器"
      :mask-closable="false"
    >
      <Form
        ref="formCustom"
        :model="formCustom"
        :rules="ruleCustom"
        label-position="top"
      >
        <FormItem
          label="标题"
          prop="title"
        >
          <Input
            v-model="formCustom.title"
            show-word-limit
            maxlength="30"
            placeholder="请输入标题"
            style="width: 100%"
          ></Input>
        </FormItem>
        <FormItem
          label="注释"
          prop="comment"
        >
          <Input
            v-model="formCustom.comment"
            autosize
            type="textarea"
            show-word-limit
            maxlength="300"
            :rows="4"
            placeholder="备注"
            style="width: 100%"
          ></Input>
        </FormItem>
      </Form>
      <div class="drawer-footer">
        <Button
          style="margin-right: 8px"
          @click="showSubmit = false"
        >Cancel</Button>
        <Button
          type="primary"
          :loading="uploading"
          @click="submit('formCustom')"
        >Submit</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
import { mavonEditor } from "mavon-editor";
import fetch from "utils/fetch";
import "mavon-editor/dist/css/index.css";

export default {
  components: { mavonEditor },
  data() {
    const validateTitle = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入标题"));
      } else {
        callback();
      }
    };
    const validateComment = (rule, value, callback) => {
      callback();
    };
    return {
      showSubmit: false,
      uploading: true,
      imgMap: new Map(),
      content: "",
      formCustom: {
        title: "",
        comment: ""
      },
      ruleCustom: {
        title: [{ validator: validateTitle, trigger: "blur" }],
        comment: [{ validator: validateComment, trigger: "blur" }]
      }
    };
  },
  methods: {
    async upload() {
      this.uploading = true;
      //检查是否需要上传图片
      if (this.imgMap.size > 0) {
        console.log("[上传图片列表]", this.imgMap);
        let formdata = new FormData();
        for (let [key, value] of this.imgMap) {
          formdata.append("image", value, key);
        }
        let res = await this.$store
          .dispatch("UploadFormData", formdata)
          .catch(err => {
            console.error(err);
          });
        console.log("[远程链接]", res);
        if (!res) {
          this.uploading = false;
          this.$Message.error("网络异常上传失败");
          return;
        }
        await new Promise(resolve => {
          setTimeout(resolve, 1000);
        });
        for (let value of res.data) {
          let url = value.url;
          this.$refs.md.$img2Url(value.key, url);
          //删除已经替换完成的图片
          this.imgMap.delete(value.key);
        }
      }
      //创建新文档
      let title = this.formCustom.title;
      let comment = this.formCustom.comment;
      let content = this.$refs.md.d_value;
      let html = this.$refs.md.d_render;
      //对标题和内容进行MD5运算
      let header = { title, comment };
      console.log("[上传文档数据]", header);
      let res = await this.$store
        .dispatch("UploadDocData", {
          header,
          content,
          html
        })
        .catch(err => {
          console.error(err);
          this.$Message.error("网络异常上传失败");
        });
      console.log(res);
      this.showSubmit = false;
      this.uploading = false;
    },
    submit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.upload()
            .then(res => {
              this.$Message.success("Success!", res);
            })
            .catch(err => {
              this.$Message.error("Fail!", err);
            });
        } else {
        }
      });
    },
    async onSave(data, render) {
      this.showSubmit = true;
      this.uploading = false;
    },
    imageClick(img) {
      console.log("[点击图片]", img);
    },
    //这里只存储文件名，等待保存时再批量上传
    imgAdd(filename, file) {
      //缓存图片名和文件
      this.imgMap.set(String(filename), file);
      console.log("[缓存图片]" + filename);
    },
    imgDel(filename) {
      this.imgMap.delete(String(filename));
      console.log("[删除图片]" + filename);
    },
    async getContent(url) {
      let doc = await fetch({
        url: url,
        method: "get"
      });
      //console.log("[详细]"+url, doc.data);
      this.content = doc.data;
    },
  },
  mounted(){
    this.info = this.$route.query;
    console.log("[编辑]",this.info);
    //如果携带编辑信息
    if(this.info){
      this.getContent(this.info.content);
      this.formCustom.title = this.info.title;
      this.formCustom.comment = this.info.comment;
    }
  }
};
</script>

<style scoped>
.editor-content {
}
.intro-head {
  text-align: center;
  margin: 10px;
}
.v-note-wrapper {
  z-index: 1 !important;
}
.drawer-footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  background: #fff;
}
</style>


