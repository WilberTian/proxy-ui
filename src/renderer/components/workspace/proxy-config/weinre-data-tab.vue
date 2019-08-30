<template>
  <div class="weinre-data-tab">
    <div class="data-wrapper" v-if="weinreLog.length > 0">
      <div v-for="(log, idx) in weinreLog" :key="idx" :class="{'item-detail': true, 'err-log': log.isErr}">{{log.detail}}</div>
    </div>
    <div
      class="no-log-msg"
      v-if="weinreLog.length === 0"
    >
      当前没有信息！
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      weinreLog: []
    }
  },
  mounted () {
    this.weinreLogListener = () => {
      this.weinreLog = this.$proxyApi.getWeinreLog()
    }
    this.$ipcRenderer.on('weinre-log-updated', this.weinreLogListener)
    this.weinreLogListener()
  },
  beforeDestroy () {
    this.$ipcRenderer.removeListener('weinre-log-updated', this.weinreLogListener)
  }
}
</script>
<style scoped>
.weinre-data-tab {
  height: 100%;
}

.weinre-data-tab .data-wrapper {
  height: 100%;
  overflow-y: auto;
}
.weinre-data-tab .data-wrapper .item-detail {
  padding: 8px;
  border-bottom: 1px solid #d7d7d7;
  color: #333;
  opacity: .7;
  font-size: 13px;
}
.weinre-data-tab .data-wrapper .item-detail.err-log {
  color: red;
}
.no-log-msg {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #999;
}
</style>
