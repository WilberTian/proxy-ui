<template>
  <div class="proxy-server-log">
    <div class="data-wrapper" v-if="proxyServerLog.length > 0">
      <div :class="{'proxy-server-log-item': true, 'is-error-item': logItem.isErr}" v-for="(logItem, idx) in proxyServerLog" :key="idx"> 
        <div class="log-item-info" v-if="logItem.info">
          {{logItem.info}}
        </div>
        <div class="log-item-detail">{{logItem.detail}}</div>
      </div>
    </div>
    <div
      class="no-error-msg"
      v-if="proxyServerLog.length === 0"
    >
      当前没有日志数据！
    </div>
  </div>
</template>

<script>
import events from '@/configs/events'
import eventBus from '@/utils/event-bus'

export default {
  data () {
    return {
      proxyServerLog: []
    }
  },
  mounted () {
    this.proxyServerLogListener = () => {
      this.proxyServerLog = this.$proxyApi.getProxyServerLog()
      eventBus.$emit(events.UPDATE_PROXY_SERVER_LOG_COUNT, this.proxyServerLog.length)
    }
    this.$ipcRenderer.on('proxy-log-updated', this.proxyServerLogListener)
    this.proxyServerLogListener()
  },
  beforeDestroy () {
    this.$ipcRenderer.removeListener('proxy-log-updated', this.proxyServerLogListener)
  }
}
</script>

<style scoped>
.proxy-server-log {
  height: 100%;
}
.proxy-server-log .data-wrapper {
  height: 100%;
  overflow-y: auto;
}
.proxy-server-log-item {
  margin: 8px;
  padding: 8px;
  max-height: 120px;
  overflow: auto;
  box-shadow: 0 0px 2px 0 rgba(15, 25, 43, 0.5);
  border-left: 2px solid #67C23A;
}
.proxy-server-log-item.is-error-item {
  box-shadow: 0 0px 2px 0 rgba(15, 25, 43, 0.5);
  border-left: 2px solid #F44336;
}
.log-item-info {
  font-size: 16px;
  font-weight: bold;
  padding-bottom: 8px;
  word-break: break-all;
}
.log-item-detail {
  font-size: 14px;
  word-break: break-all;
}
.proxy-server-log .no-error-msg {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #999;
}
</style>
