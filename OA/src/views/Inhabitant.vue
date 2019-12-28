<template>
  <div class="animated fadeIn">
    <Modal v-model="isShowModal" title="生成注册二维码" @on-ok="modalOk" @on-cancel="modalCancel">
      <QrCode :form="qrCodeData"/>
    </Modal>
    <Drawer
      title="Create"
      v-model="isOpenDrawer"
      width="100"
      :mask-closable="false"
      :styles="styles"
    >
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
        <FormItem label="Id" prop="id">
          <Input :disabled="true" v-model="formValidate.id" placeholder="请输入识别码"></Input>
        </FormItem>
        <FormItem label="UUID" prop="uuid">
          <Input :disabled="true" v-model="formValidate.uuid" placeholder="请输入唯一码"></Input>
        </FormItem>
        <FormItem label="名称" prop="name">
          <Input :disabled="true" v-model="formValidate.name" placeholder="请输入名称"></Input>
        </FormItem>
        <FormItem label="户主名称" prop="host">
          <Input v-model="formValidate.host_name" placeholder="请输入户主名称"></Input>
        </FormItem>
        <FormItem label="户主" prop="host">
          <Input v-model="formValidate.host" placeholder="请输入户主"></Input>
        </FormItem>
        <FormItem label="手机号" prop="tel">
          <Input v-model="formValidate.tel" placeholder="请输入手机号"></Input>
        </FormItem>
        <FormItem label="社区" prop="community_name">
          <Input v-model="formValidate.community_name" placeholder="请输入社区"></Input>
        </FormItem>
        <FormItem label="区块" prop="block_name">
          <Input v-model="formValidate.block_name" placeholder="请输入区块"></Input>
        </FormItem>
        <FormItem label="楼层" prop="floor">
          <Input v-model="formValidate.floor" placeholder="请输入楼层"></Input>
        </FormItem>
        <FormItem label="门牌号" prop="doorplate">
          <Input v-model="formValidate.doorplate" placeholder="请输入门牌号"></Input>
        </FormItem>
        <FormItem label="管理权限" prop="permission">
          <Input v-model="formValidate.permission" placeholder="请输入权限"></Input>
        </FormItem>
      </Form>
      <div class="demo-drawer-footer">
        <Button style="margin-right: 8px" @click="isOpenDrawer = false">Cancel</Button>
        <Button type="primary" @click="submit('formValidate')">Submit</Button>
      </div>
    </Drawer>
    <Row>
      <Col span="1" style="width:100px" class="book-detail-store-item align-center-vertical">社区</Col>
      <Col span="4">
        <Select v-model="model1" clearable style="width:200px" @on-change="searchChange">
          <Option
            v-for="(item, index) in communityList"
            :value="item.value"
            :key="index"
          >{{ item.value }}</Option>
        </Select>
      </Col>
    </Row>
    <Row>
      <Col span="1" style="width:100px" class="book-detail-store-item align-center-vertical">房号</Col>
      <Col span="4">
        <Input v-model="model2" placeholder="请输入" clearable style="width:200px"></Input>
      </Col>
    </Row>
    <Row>
      <Col span="1" style="width:100px" class="book-detail-store-item align-center-vertical">实名</Col>
      <Col span="4">
        <Input v-model="model3" placeholder="请输入" clearable style="width:200px"></Input>
      </Col>
    </Row>
    <Row>
      <Col span="1" style="width:100px" class="book-detail-store-item align-center-vertical">手机号</Col>
      <Col span="4">
        <Input
          v-model="model4"
          placeholder="请输入"
          type="tel"
          maxlength="11"
          show-word-limit
          style="width:200px"
        ></Input>
      </Col>
    </Row>
    <Row>
      <Col span="1" style="width:100px" class="book-detail-store-item align-center-vertical">标签</Col>
      <Col span="4">
        <Select v-model="model5" multiple style="width:400px">
          <Option
            v-for="(item, index) in labelList"
            :value="item.value"
            :key="index"
          >{{ item.value }}</Option>
        </Select>
      </Col>
    </Row>
    <Row type="flex" justify="start" align="middle" :gutter="8">
      <Col class="option">
        <Button size="large" type="primary" @click="refreshData()">
          <Icon type="ios-refresh"></Icon>刷新
        </Button>
      </Col>
      <Col class="option">
        <Button size="large" type="primary" @click="searchData()">
          <Icon type="ios-search"></Icon>查询
        </Button>
      </Col>
      <Col class="option">
        <Button size="large" type="primary" @click="addData()">
          <Icon type="ios-add"></Icon>增加
        </Button>
      </Col>
      <Col class="option">
        <Button size="large" type="primary" :disabled="!this.selected.length" @click="editData()">
          <Icon type="ios-options"></Icon>修改
        </Button>
      </Col>
      <Col class="option">
        <Button size="large" type="primary" :disabled="!this.selected.length" @click="removeData()">
          <Icon type="ios-close"></Icon>删除
        </Button>
      </Col>
      <Col class="option">
        <Button
          size="large"
          type="primary"
          :disabled="!this.selected.length"
          @click="generateQrCode()"
        >
          <Icon type="ios-code"></Icon>生成二维码
        </Button>
      </Col>
      <Col class="option">
        <Button size="large" type="primary" @click="uploadData()">
          <Icon type="ios-download"></Icon>导出表格
        </Button>
      </Col>
      <Col class="option">
        <Button size="large" type="primary" @click="downloadData()">
          <Icon type="ios-download"></Icon>导入表格
        </Button>
      </Col>
    </Row>
    <br />
    <Row>
      <Table
        border
        :loading="loading"
        :columns="columns"
        :data="data"
        @on-select="itemSelect"
        @on-select-cancel="itemSelect"
        @on-select-all="itemSelect"
        @on-select-all-cancel="itemSelect"
      ></Table>
    </Row>
    <Row type="flex" justify="end" align="middle">
      <div style="margin: 10px;overflow: hidden">
        <div style="float: right;">
          <Page
            show-sizer
            show-total
            show-elevator
            :placement="'top'"
            :page-size-opts="[5,10,20,50]"
            :page-size="pageSize"
            :total="total"
            :current="current"
            @on-change="pIndexChange"
            @on-page-size-change="pSizeChange"
          ></Page>
        </div>
      </div>
    </Row>
  </div>
</template>

<script>
import timer from "utils/timer";
import QrCode from "views/components/QrCode.vue";
export default {
  components: { QrCode },
  name: "dashboard",
  data() {
    return {
      qrCodeData:null,
      isShowModal: false,
      formValidate: {
        id: "",
        uuid: "",
        name: "",
        host_name:"",
        host: "",
        doorplate: "",
        floor: "",
        block_name: "",
        community_name: "",
        permission: ""
      },
      ruleValidate: {
        id: [{ required: false }],
        uuid: [{ required: false }],
        name: [{ required: false }],
        host_name:[{ required: false }],
        host: [{ required: false }],
      },
      isOpenDrawer: false,
      selected: [],
      styles: {
        height: "calc(100% - 55px)",
        overflow: "auto",
        paddingBottom: "53px",
        position: "static"
      },
      communityIdMap: new Map(),
      blockIdMap: new Map(),
      searchCommunityName: "",
      loading: true,
      pageSize: 5,
      total: 0,
      current: 1,
      communityList: [],
      blockList: [],
      labelList: [{ value: "未绑定" }, { value: "租户" }, { value: "户主" }],
      model1: "",
      model2: "",
      model3: "",
      model4: "",
      model5: "",
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          title: "名称",
          key: "name",
          sortable: true,
          tooltip: true,
          minWidth: 150
        },
        {
          title: "社区",
          key: "community_name",
          filters: [],
          filterMultiple: true,
          filterMethod(value, row) {
            return row.community_name.indexOf(value) > -1;
          },
          tooltip: true,
          minWidth: 100
        },
        {
          title: "区块",
          key: "block_name",
          filters: [],
          filterMultiple: true,
          filterMethod(value, row) {
            return row.block_name.indexOf(value) > -1;
          },
          tooltip: true,
          minWidth: 100
        },
        {
          title: "屋主",
          key: "host_name",
          sortable: true,
          tooltip: true,
          minWidth: 100
        },
        {
          title: "手机号",
          key: "tel",
          sortable: true,
          tooltip: true,
          minWidth: 150
        },
        {
          title: "楼层",
          key: "floor",
          align: "center",
          sortable: true,
          tooltip: true,
          minWidth: 75
        },
        {
          title: "房号",
          key: "doorplate",
          align: "center",
          sortable: true,
          tooltip: true,
          minWidth: 75
        },
        {
          title: "管理权",
          key: "permission",
          align: "center",
          sortable: true,
          tooltip: true,
          minWidth: 75
        }
      ],
      data: []
    };
  },
  computed: {},
  methods: {
    async refreshData() {
      this.selected = [];
      //console.log("[请求数据]");
      let loadingTimer = timer.getTimer(
        500,
        () => {
          this.loading = true;
        },
        () => {
          this.loading = false;
        }
      );
      //获取用户列表
      let res = await this.$store
        .dispatch("GetUserList", {
          pageSize: this.pageSize,
          current: this.current,
          community_id: this.searchCommunityId
        })
        .catch(err => {
          this.$Message.error(err);
          this.loading = false;
        });
      console.log("[获取数据]", res.data);
      loadingTimer.resolve();
      //检查返回数据有效性
      if (res && res.data) {
        let room = res.data.room;
        let total = res.data.total;
        if (res.data.community) {
          let arr = [];
          for (let community of res.data.community) {
            arr.push({ value: community.name, label: community.name });
            this.communityIdMap.set(community.name, community.id);
          }
          this.communityList = arr;
          this.columns[2].filters = arr;
        }
        if (res.data.block) {
          let arr = [];
          for (let block of res.data.block) {
            arr.push({ value: block.name, label: block.name });
            //this.blockIdMap.set(block.name,block.id);
          }
          this.blockList = arr;
          this.columns[3].filters = arr;
        }

        if (room && room.length) {
          this.total = total;
          this.data = room;
        } else {
          this.total = 0;
          this.data = [];
        }
      } else {
        this.total = 0;
        this.data = [];
      }
    },
    searchChange(change) {
      let lastId = this.searchCommunityId;
      this.searchCommunityId = this.communityIdMap.get(change);
      if (lastId != this.searchCommunityId) {
        this.refreshData();
      }
    },
    searchData() {},
    uploadData() {},
    downloadData() {},
    addData() {},
    removeData() {},
    editData() {
      this.isOpenDrawer = true;
    },
    pIndexChange(index) {
      //console.log("[切换页面索引]" + index);
      this.current = index;
      this.refreshData();
    },
    pSizeChange(size) {
      //console.log("[单页面显示]" + size);
      this.pageSize = size;
      this.refreshData();
    },
    itemSelect(selected) {
      //console.log("[选择]", selected);
      if (selected.length) {
        this.formValidate = selected[0];
      }
      this.selected = selected;
    },
    submit(name) {
      //console.log("[提交表单]", name);
      this.$refs[name].validate(async valid => {
        if (valid) {
          console.log("[提交表单]", this.formValidate);
          let res = await this.$store
            .dispatch("SubmitForm", this.formValidate)
            .catch(err => {
              this.$Message.error(err);
            });
          //如果结果存在
          if (res) {
            await this.refreshData();
          }
          console.log("[结果]", res);
          this.$Message.success("Success!");
          this.isOpenDrawer = false;
        } else {
          this.$Message.error("Fail!");
        }
      });
    },
    generateQrCode() {
      this.isShowModal = true;
      this.qrCodeData = this.formValidate;
    },
    modalOk(){},
    modalCancel(){}
  },
  created() {
    this.refreshData();
  },
  mounted() {
    //const token = this.$store.getters.token;
  }
};
</script>

<style>
.option {
  margin-top: 5px;
}

.book-detail-store-item {
  white-space: nowrap;
  height: 36px;
  font-size: 24px;
}
.align-center-vertical {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
}
.demo-drawer-footer {
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