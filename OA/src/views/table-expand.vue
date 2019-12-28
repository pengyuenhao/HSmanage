// expand-row.vue
<style scoped>
    .expand-row{
        margin-bottom: 16px;
    }
  
</style>
<template>
    <Steps :current="1"   v-if="row.task_status===0" >
        <Step title="已上传" ></Step>
        <Step title="正在审核" content="正在审核，需要1-3个工作日,请耐心等待"></Step>
        <Step title="审核完成"></Step>
    </Steps>
     <Steps :current="2"   v-else-if="row.task_status===1">
        <Step title="已上传" ></Step>
        <Step title="正在审核" ></Step>
        <Step title="审核通过" content="审核通过，请点击查看"></Step>
    </Steps>
    <Steps :current="3"   v-else-if="row.task_status===2">
        <Step title="已上传" ></Step>
        <Step title="正在审核" ></Step>
        <Step title="审核未通过" content="审核未通过，请点击查看"></Step>
    </Steps>
    <Steps :current="0"   v-else-if="row.task_status===2">
        <Step title="正在上传"  content="正在上传，请等待"></Step>
        <Step title="等待审核" ></Step>
        <Step title="审核完成" ></Step>
    </Steps>
</template>
<script>
    export default {
        props: {
            row: Object
        }
    };
</script>
