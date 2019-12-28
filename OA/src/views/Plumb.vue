<template>
  <div>
    <view
      id="item_left"
      class="item"
    ></view>
    <view
      id="item_right"
      class="item"
      style="margin-left:150px;"
    ></view>
  </div>
</template>

<script>
export default {
  components: {},
  name: "plumb",
  data() {
    return {};
  },
  methods: {},
  mounted() {
  }
};
</script>


<style type="text/css" scoped>
  .item{
    width: 100rpx;
    height: 100rpx;
    background: red;
    border: 10rpx solid red;
  }
</style>