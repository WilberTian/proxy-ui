<template>
  <div class="proxy-server-error">
    <div class="data-wrapper" v-if="errorLog.length > 0">
      <el-collapse accordion>
        <el-collapse-item v-for="(err, idx) in errorLog" :key="idx" :title="err.info"> 
          <div class="err-item-detail">{{err.detail}}</div>
        </el-collapse-item>
      </el-collapse>
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
.proxy-server-error {
  height: 100%;
}
.proxy-server-error .data-wrapper {
  height: 100%;
  overflow-y: auto;
}
.err-item-detail {
  padding: 12px;
  overflow: auto;
  background-color: #efefef;
  white-space: pre;
}
.proxy-server-error .no-error-msg {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #999;
}
</style>
