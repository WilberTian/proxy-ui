<template>
  <div class="section-data-wrapper">
    <div class="section-title" v-if="title">
      {{title}}
    </div>
    <div class="section-data">
      <div class="section-data-item" v-for="(value, key) in kvData" :key="key">
        <div class="key">
          {{key}}
        </div>
        <div class="value">
          {{value}}
        </div>
      </div>
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
      default: function () {
        return {}
      }
    }
  }
}
</script>
<style scoped>
.section-data-wrapper {
  margin-bottom: 32px;
  padding: 0 8px;
}
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
}
.section-data-item {
  display: flex;
  font-size: 12px;
  margin: 12px 8px;
  opacity: .8;
  color: #333;
}
.section-data-item .key {
  width: 120px;
  padding-right: 8px;
  text-align: right;
  font-weight: bold;
  word-wrap: break-word;
  word-break: break-all;
}
.section-data-item .value {
  flex: 1;
  padding-left: 8px;
  word-wrap: break-word;
  word-break: break-all;
  border-left: 1px solid #ccc;
}
</style>
