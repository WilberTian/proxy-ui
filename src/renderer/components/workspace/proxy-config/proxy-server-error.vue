<template>
  <div class="proxy-server-error">
    <div class="data-wrapper" v-if="errorLog.length > 0">
      <div class="error-item" v-for="(err, idx) in errorLog" :key="idx">
        <div class="error-info">{{err.info}}</div>
        <el-tooltip class="item" effect="dark" :content="err.detail" placement="left">
          <i class="el-icon-info"></i>
        </el-tooltip>
      </div>
    </div>
    <div
      class="no-error-msg"
      v-if="errorLog.length === 0"
    >
      当前没有错误信息！
    </div>
  </div>
</template>

<script>
import events from '@/configs/events'
import eventBus from '@/utils/event-bus'

export default {
  data () {
    return {
      errorLog: []
    }
  },
  mounted () {
    this.errorLogListener = () => {
      this.errorLog = this.$proxyApi.getErrorLog()
      eventBus.$emit(events.UPDATE_PROXY_ERR_COUNT, this.errorLog.length)
    }
    this.$ipcRenderer.on('error-log-updated', this.errorLogListener)
    this.errorLogListener()
  },
  beforeDestroy () {
    this.$ipcRenderer.removeListener('error-log-updated', this.errorLogListener)
  }
}
</script>

<style scoped>
.proxy-server-error .data-wrapper {
  padding: 4px;
}
.error-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding: 8px;
}
.error-item:first-child {
  border-top: 1px solid #ccc;
}
.error-item .error-info {
  flex: 1;
}
.proxy-server-error .no-error-msg {
  padding-top: 40vh;
  text-align: center;
  height: 24px;
  line-height: 24px;
  font-size: 20px;
  font-weight: bold;
  color: #999;
}
</style>
