<template>
  <div class="section-data-wrapper">
    <div class="section-title" v-if="title">
      {{ title }}
    </div>
    <div
      v-if="typeof kvData === 'object' && Object.keys(kvData).length > 0"
      class="section-data"
    >
      <div class="section-data-item" v-for="(value, key) in kvData" :key="key">
        <div class="key">
          {{ key }}
        </div>
        <div class="value">
          {{ value }}
        </div>
      </div>
    </div>
    <div v-else class="section-data">
      没有数据
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String
    },
    kvData: {
      type: Object,
      default: function() {
        return {}
      }
    }
  }
}
</script>
<style lang="less" scoped>
.section-data-wrapper {
  margin-bottom: 32px;
  padding: 0 8px;

  .section-title {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    border-bottom: 1px solid #efefef;
    padding: 8px 4px;
    margin-bottom: 8px;
  }
  .section-data {
    margin: 0 4px;
    font-size: 12px;
    padding: 12px;
    background-color: #efefef;

    .section-data-item {
      display: flex;
      margin: 12px 8px;
      opacity: 0.8;
      color: #333;
      .key {
        width: 120px;
        padding-right: 8px;
        text-align: right;
        font-weight: bold;
        word-break: break-word;
      }
      .value {
        flex: 1;
        padding-left: 8px;
        word-break: break-word;
        border-left: 1px solid #ccc;
      }
    }
  }
}
</style>
