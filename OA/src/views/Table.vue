<template>
  <div class="animated fadeIn">

    <Row>
      <Col :md="24">
      <div>
        <div
          id="container"
          style="margin-bottom:10px;"
        >
          <Button
            type="primary"
            size="large"
            icon="ios-refresh"
            @click="getIndexList"
            style="padding-bottom:5px;"
          >刷新列表</Button>
          <Button
            type="primary"
            size="large"
            icon="ios-add-circle-outline"
            @click="create_doc"
            style="padding-bottom:5px;"
          >创建文档</Button>
          <Button
            type="primary"
            size="large"
            icon="ios-cloud-upload-outline"
            id='pickfiles'
            @click="qiniu_upload"
            style="padding-bottom:5px;"
          >本地上传</Button>
          <Progress
            :percent="progresscount"
            :status="progresstatus"
            style="width=90%;vertical-align:middle"
            v-if="progresshow"
          >
            <Icon
              type="checkmark-circled"
              v-if="progresscount==100"
            ></Icon>
            <span v-if="progresscount===100">上传成功</span>
            <Icon
              type="close-circled"
              v-if="progresstatus==='wrong'"
            ></Icon>
            <span v-if="progresstatus==='wrong'">上传失败</span>
            <span
              style="position:absolute;left:50%;top:-5px;"
              v-if="progresscount!==0&&progresscount!=100"
            >{{progressspeed}}</span>
          </Progress>
        </div>
        <div style="position:relative;">
          <Table
            :columns="columns7"
            :data="page_video_list"
            ref="table"
          ></Table>
          <div
            style="position:absolute;top:0px;width:100%;height:100%;display: flex;
                            align-items: center;
                            justify-content: center;background: rgba(210, 216, 222, 0.5);"
            v-if="list_loadding"
          >
            <Spin size="large"></Spin>
            <h6 style="color:#2d8cf0;margin-top:10px;">正在获取数据...</h6>
          </div>
        </div>
        <Page
          :total="this.video_list.length"
          show-total
          @on-change="setInitPage"
          style="text-align:right;margin-top:50px"
        ></Page>
        <Button
          type="primary"
          size="large"
          @click="exportData(1)"
        >
          <Icon type="ios-download-outline"></Icon> 导出原始数据
        </Button>
        <Button
          type="primary"
          size="large"
          @click="exportData(2)"
        >
          <Icon type="ios-download-outline"></Icon> 导出排序和过滤后的数据
        </Button>
      </div>
      <div
        style=""
        class="doc-content"
      >
      </div>
      </Col>
      <Col :md="12">
      </Col>
    </Row>
  </div>
</template>

<script>
import expandRow from "./table-expand.vue";
import { dateFtt } from "utils/format";
import fetch from "utils/fetch";

var vue;
var uploader;
function getVideoName(video_name) {
  var video_name = "";
  var img_ext_list = [".jpg", ".png", ".jpeg"];
  img_ext_list.forEach(function(e) {
    if (video_name.indexOf(e) !== -1) {
      let point_index = video_name.indexOf(e);
      let leaf_index = video_name.lastIndexOf("/", point_index);
      let line_index = video_name.lastIndexOf("_", point_index);
      video_name = video_name.substring(line_index + 1);
      return video_name;
    }
  });

  var video_ext_list = [".mp4"];
  video_ext_list.forEach(function(e) {
    if (video_name.indexOf(e) !== -1) {
      let point_index = video_name.indexOf(e);
      let leaf_index = video_name.lastIndexOf("/", point_index);
      let line_index = video_name.lastIndexOf("_", point_index);
      video_name = video_name.substring(line_index + 1);
      return video_name;
    }
  });
  return video_name;
}

function getVideoDuration(video_author_before) {
  let video_author = parseInt(video_author_before);
  if (video_author <= 60) {
    if (video_author < 10) video_author = "00:00:0" + video_author;
    else video_author = "00:00:" + video_author;
  } else if (video_author > 60 && video_author <= 60 * 60) {
    const minute = Math.floor(video_author / 60);
    const s = Math.floor(video_author % 60);
    if (minute < 10) video_author = "00:0" + minute;
    else video_author = "00:" + minute;

    if (s < 10) video_author = video_author + ":0" + s;
    else video_author = video_author + ":" + s;
  } else if (video_author > 60 * 60 && video_author < 60 * 60 * 60) {
    const hour = Math.floor(video_author / 3600);

    const minute = Math.floor((video_author % 3600) / 60);
    const s = Math.floor((video_author % 3600) % 60);
    if (hour < 10) video_author = "0" + hour;
    else video_author = hour + "";

    if (minute < 10) video_author = video_author + ":0" + minute;
    else video_author = video_author + ":" + minute;

    if (s < 10) video_author = video_author + ":0" + s;
    else video_author = video_author + ":" + s;
  }

  return video_author;
}
function getVideoSize(video_size) {
  if (video_size < 1024) video_size = Math.round(video_size * 100) / 100 + " B";
  else if (video_size >= 1024 && video_size < 1024 * 1024)
    video_size = Math.round((video_size / 1024) * 100) / 100 + " Kb";
  else if (video_size >= 1024 * 1024 && video_size < 1024 * 1024 * 1024)
    video_size = Math.round((video_size / (1024 * 1024)) * 100) / 100 + " Mb";

  return video_size;
}

function qiniuInit(vue) {
  //console.log(Qiniu);
  uploader = Qiniu.uploader({
    runtimes: "html5,flash,html4", // 上传模式，依次退化
    browse_button: "pickfiles", // 上传选择的点选按钮，必需
    uptoken_func: function() {
      // 在需要获取uptoken时，该方法会被调用
      // return "123";
    },
    get_new_uptoken: false, // 设置上传文件的时候是否每次都重新获取新的uptoken
    // downtoken_url: '/downtoken',
    // Ajax请求downToken的Url，私有空间时使用，JS-SDK将向该地址POST文件的key和domain，服务端返回的JSON必须包含url字段，url值为该文件的下载地址
    unique_names: false, // 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
    save_key: false, // 默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
    domain: "http://www.zzxx48.com/", // bucket域名，下载资源时用到，必需
    container: "container", // 上传区域DOM ID，默认是browser_button的父元素
    max_file_size: "1024mb", // 最大文件体积限制
    flash_swf_url: "static/bower_components/plupload/js/Moxie.swf", //引入flash，相对路径
    max_retries: 0, // 上传失败最大重试次数
    dragdrop: true, // 开启可拖曳上传
    drop_element: "container", // 拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
    chunk_size: "10mb", // 分块上传时，每块的体积
    auto_start: true, // 选择文件后自动上传，若关闭需要自己绑定事件触发上传
    multi_selection: true,
    filters: {
      max_file_size: "1000mb",
      prevent_duplicates: false,
      // Specify what files to browse for
      mime_types: [
        { title: "Video files", extensions: "mp4" }, // 限定flv,mpg,mpeg,avi,wmv,mov,asf,rm,rmvb,mkv,m4v,mp4后缀格式上传
        { title: "Image files", extensions: "jpg,png,jpeg" } // 限定jpg,gif,png后缀上传
      ]
    },
    init: {
      FilesAdded: function(up, files) {
        plupload.each(files, function(file) {
          vue.progresshow = true;
        });
      },
      BeforeUpload: function(up, file) {
        vue.progresscount = 10;
        vue.progresstatus = "active";

        vue.progressspeed = "1.5 Mb/s";

        var interval = setInterval(function() {
          if (vue.progresscount === 40) {
            clearInterval(interval);

            vue.$Notice.success({ title: "上传成功" });

            setTimeout(function() {
              vue.progressspeed = 0;
              vue.progresstatus = "wrong";

              vue.$Message.error("上传失败");
              setTimeout(function() {
                vue.progresscount = 0;

                vue.progresshow = false;

                var obj = {
                  task_status: 0,
                  timestamp: "2017-08-10 17:03:54",
                  video_author: "11.121667",
                  video_size: 1732410,
                  video_name:
                    "http://otl6ypoog.bkt.clouddn.com/Objectstoarge/videos/2017-08-10/33337_p.mp4"
                };

                vue.video_list.push(obj);
                vue.setInitPage(1);
              }, 4000);
            }, 1000);
          } else {
            vue.progresscount += 2;
          }
        }, 100);
      },
      UploadProgress: function(up, file) {},
      FileUploaded: function(up, file, info) {},
      Error: function(up, err, errTip) {
        //上传出错时，处理相关的事情
      },
      UploadComplete: function() {
        //队列文件处理完毕后，处理相关的事情
      },
      Key: function(up, file) {
        // return key
      }
    }
  });
}
export default {
  components: { expandRow },

  name: "buttons",
  data() {
    return {
      progresshow: false,
      progresscount: 0,
      progresstatus: "active",
      progressspeed: 0,
      video_list: [],
      pageindex: 1,
      pageLimit: 10,
      page_video_list: [],
      lodding: false,
      list_loadding: false,
      columns7: [
        {
          type: "expand",
          width: "30",
          ellipsis: "true",

          render: (h, params) => {
            return h(expandRow, {
              props: {
                row: params.row
              }
            });
          }
        },
        {
          title: "标题",
          key: "title",
          ellipsis: "true"
        },
        {
          title: "上传时间",
          ellipsis: "true",
          key: "time",
          render: (h, parmas) => {
            let time = dateFtt("yyyy-MM-dd hh:mm", new Date(parmas.row.time));
            return h(
              "div",
              {
                props: {}
              },
              time
            );
          }
        },

        {
          title: "作者",
          ellipsis: "true",
          key: "name"
        },
        {
          title: "大小",
          ellipsis: "true",
          key: "size",
          filters: [
            {
              label: "大于10M",
              value: 1
            },
            {
              label: "小于10M",
              value: 2
            }
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            if (value === 1) {
              return row.video_size > 1024 * 1024 * 1024 * 10;
            } else if (value === 2) {
              return row.video_size < 1024 * 1024 * 10;
            }
          }
        },
        {
          title: "状态",
          width: 150,
          ellipsis: "true",
          filters: [
            {
              label: "等待审核",
              value: 1
            },
            {
              label: "审核通过",
              value: 2
            },
            {
              label: "审核不通过",
              value: 3
            }
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            switch (value) {
              case 1:
                return row.task_status === 1;
              case 2:
                return row.task_status === 0;
              case 3:
                return row.task_status === 2;
            }
          },

          render: (h, params) => {
            let status = params.row.task_status;
            const task_status = parseInt(status ? status : 0);
            switch (task_status) {
              case 0:
                return h("div", [
                  h(
                    "Tag",
                    {
                      props: {
                        type: "dot",
                        color: "blue"
                      }
                    },
                    "等待审核"
                  )
                ]);
              case 1:
                return h("div", [
                  h(
                    "Tag",
                    {
                      props: {
                        type: "dot",
                        color: "green"
                      }
                    },
                    "审核通过"
                  )
                ]);
              case 2:
                return h("div", [
                  h(
                    "Tag",
                    {
                      props: {
                        type: "dot",
                        color: "red"
                      }
                    },
                    "审核未通过"
                  )
                ]);
            }
          }
        },
        {
          title: "操作",
          width: 200,
          key: "action",
          align: "center",
          ellipsis: "true",

          render: (h, params) => {
            let status = params.row.operate_status;
            const operate_status = parseInt(status ? status : 0);
            switch (operate_status) {
              case 0:
                return h("div", [
                  h(
                    "Button",
                    {
                      props: {
                        type: "primary",
                        size: "small"
                      },
                      style: {
                        width: "75px",
                        marginRight: "5px"
                      },
                      on: {
                        click: () => {
                          let json = this.page_video_list[params.index];
                          console.log("[查看]",json);
                          this.$router.push({
                            path:"/tabledocdetail/",
                            query:json
                          });
                        }
                      }
                    },
                    "查看"
                  ),
                  h(
                    "Button",
                    {
                      props: {
                        type: "error",
                        size: "small"
                      },
                      on: {
                        click: () => {
                          this.remove(params.index);
                        }
                      }
                    },
                    "删除"
                  )
                ]);

              case 1:
                return h("div", [
                  h(
                    "Tooltip",
                    {
                      props: {
                        content: "正在上传到服务器"
                      }
                    },
                    [
                      h(
                        "Button",
                        {
                          props: {
                            type: "primary",
                            size: "small",
                            loading: true
                          },
                          style: {
                            width: "75px",
                            marginRight: "5px"
                          }
                        },
                        "上传中"
                      )
                    ]
                  ),
                  h(
                    "Button",
                    {
                      props: {
                        type: "error",
                        size: "small",
                        disabled: true
                      },
                      on: {
                        click: () => {
                          this.remove(params.index);
                        }
                      }
                    },
                    "删除"
                  )
                ]);
              case 2:
                return h("div", [
                  h(
                    "Tooltip",
                    {
                      props: {
                        content: "还未下载完成，暂时不能查看"
                      }
                    },
                    [
                      h(
                        "Button",
                        {
                          props: {
                            type: "primary",
                            size: "small",
                            loading: true
                          },
                          style: {
                            width: "75px",
                            marginRight: "5px"
                          }
                        },
                        "下载中"
                      )
                    ]
                  ),
                  h(
                    "Button",
                    {
                      props: {
                        type: "error",
                        size: "small",
                        disabled: true
                      },
                      on: {
                        click: () => {
                          this.remove(params.index);
                        }
                      }
                    },
                    "删除"
                  )
                ]);
            }
          } //render
        } //{
      ] //cloumn
    }; //return
  }, //data
  methods: {
    /**获取文档索引列表 */
    async getIndexList() {
      let that = this;
      this.video_list = [];
      this.list_loadding = true;
      let res = await this.$store
        .dispatch("GetDocList", { limit: this.pageLimit, offset: 0 })
        .catch(err => {
          console.error(err);
          this.$Message.error("网络异常上传失败");
        });
      //console.log("[获取文档列表]", res);
      for (let hash in res.data) {
        let url = res.data[hash];
        //console.log("[URL]",url);
        let doc = await fetch({
          url: url.header,
          method: "get"
        });
        doc.data.content = url.content;
        doc.data.html = url.html;
        this.video_list.push(doc.data);
      }
      this.setInitPage(1);
      this.list_loadding = false;
      //console.log("[文档]", this.video_list);
    },
    remove(index) {
      this.video_list.splice(index, 1);
    },
    qiniu_upload() {
      uploader.start();
    },
    create_doc() {
      console.log("[创建文档]");
      this.$router.push({
        path: "/markdown/"
      });
    },
    setInitPage(page) {
      this.page_video_list = [];
      this.pageindex = page;
      let video_list = this.video_list;
      for (
        let i = (page - 1) * this.pageLimit;
        i < (page - 1) * this.pageLimit + this.pageLimit;
        i++
      ) {
        if (i < video_list.length) {
          this.page_video_list.push(this.video_list[i]);
        }
      }
    },
    exportData(type) {
      if (type === 1) {
        this.$refs.table.exportCsv({
          filename: "原始数据",
          columns: this.columns7,
          data: this.video_list
        });
      } else if (type === 2) {
        this.$refs.table.exportCsv({
          filename: "排序和过滤后的数据",
          original: false
        });
      }
    }
  },
  mounted() {
    this.getIndexList();
    qiniuInit(this); //初始化七牛数据
  }
  /*   updated() {
    if (!this.video_list || !this.video_list.length) {
      console.log("123");
      let list = [
        {
          task_status: 0,
          timestamp: "2017-08-10 17:03:54",
          video_author: "11s",
          video_size: 1732410,
          video_name: "p.mp4"
        },
        {
          task_status: 2,
          timestamp: "2017-08-10 17:03:54",
          video_author: "11s",
          video_size: 1732410,
          video_name: "p.mp4"
        },
        {
          task_status: 1,
          timestamp: "2017-08-10 17:03:54",
          video_author: "11s",
          video_size: 1732410,
          video_name: "p.mp4"
        },
        {
          task_status: 2,
          timestamp: "2017-08-10 17:03:54",
          video_author: "11s",
          video_size: 1732410,
          video_name: "p.mp4"
        },
        {
          task_status: 1,
          timestamp: "2017-08-10 17:03:54",
          video_author: "11s",
          video_size: 1732410,
          video_name: "p.mp4"
        },
        {
          task_status: 0,
          timestamp: "2017-08-10 17:03:54",
          video_author: "11s",
          video_size: 1732410,
          video_name: "p.mp4"
        }
      ];
    }
  } */
};
</script>


<style type="text/css" scoped>
.ivu-tag-dot {
  border: none !important;
}
tr.ivu-table-row-hover td .ivu-tag-dot {
  background-color: #ebf7ff !important;
}

.demo-i-circle-custom h1 {
  color: #3f414d;
  font-size: 10px;
  font-weight: normal;
}
.demo-i-circle-custom p {
  color: #657180;
  font-size: 8px;
  margin: 5px 0 2px;
}
.demo-i-circle-custom span {
  display: block;
  padding-top: 15px;
  color: #657180;
  font-size: 10px;
}
.demo-i-circle-custom span :before {
  content: "";
  display: block;
  width: 50px;
  height: 1px;
  margin: 0 auto;
  background: #e0e3e6;
  position: relative;
  top: -20px;
}
.demo-i-circle-custom span i {
  font-style: normal;
  color: #3f414d;
}
/*wz-btn wz-btn-primary wz-btn-small wz-btn-loading*/

.ivu-btn.ivu-btn-primary.ivu-btn-small:not(.ivu-btn-loading) {
  padding: 2px 10px !important;
}
td.ivu-table-expanded-cell {
  background-color: white !important;
}
</style>



