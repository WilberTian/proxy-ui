<template>
  <div class="workspace-footer">
    <div v-if="proxyServerStatus" class="record-count-info">
      共 {{recordCount}} 条数据
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      recordCount: 'getRecordCount',
      proxyServerStatus: 'getProxyServerStatus'
    })
  }
}
</script>

<style lang="less" scoped>
.workspace-footer {
  background-color: #e1e1e1;
  height: 24px;

  .record-count-info {
    line-height: 24px;
    padding: 0 8px;
    font-size: 12px;
    font-weight: bold;
  }
}
</style>
