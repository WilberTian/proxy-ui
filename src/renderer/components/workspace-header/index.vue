<template>
  <div class="workspace-header">
    <svgicon
      v-if="proxyServerStatus === 0"
      class="start-icon"
      icon="start" width="24" height="24" color="#67c23a"
      @click="startProxyServer"
    ></svgicon>
    <svgicon
      v-if="proxyServerStatus === 1"
      class="restart-icon"
      icon="restart"
      width="28" height="28" color="#67c23a"
      @click="restartProxyServer"
    ></svgicon>
    <svgicon
      v-if="proxyServerStatus === 1"
      class="stop-icon"
      icon="stop"
      width="24" height="24" color="red"
      @click="stopProxyServer"
    ></svgicon>
    <svgicon
      v-if="proxyServerStatus === 0"
      class="settings-icon"
      icon="settings"
      width="24" height="24" color="#333"
    ></svgicon>
  </div>
</template>

<script>
import '@/assets/icons/start'
import '@/assets/icons/stop'
import '@/assets/icons/restart'
import '@/assets/icons/settings'

export default {
  data () {
    return {
      proxyServerStatus: 0 // 0 stands for stop, 1 stands for running
    }
  },
  methods: {
    startProxyServer () {
      const proxyConfig = this.$proxyApi.generateProxyConfig()
      this.$proxyApi.startProxyServer(proxyConfig).then((data) => {
        this.$notify({
          title: '提示',
          message: data.msg,
          type: 'success'
        })
        this.proxyServerStatus = 1
      }, (e) => {
        this.$notify({
          title: '错误信息',
          message: e.message,
          type: 'error'
        })
        this.proxyServerStatus = 0
      })
    },
    stopProxyServer () {
      this.$proxyApi.stopProxyServer().then((data) => {
        this.$notify({
          title: '提示',
          message: data.msg,
          type: 'success'
        })
        this.proxyServerStatus = 0
      })
    },
    restartProxyServer () {
      const proxyConfig = this.$proxyApi.generateProxyConfig()
      this.$proxyApi.restartProxyServer(proxyConfig).then((data) => {
        this.$notify({
          title: '提示',
          message: data.msg,
          type: 'success'
        })
        this.proxyServerStatus = 1
      })
    }
  }
}
</script>

<style scoped>
.workspace-header {
  display: flex;
  align-items: center;
  height: 36px;
}
.workspace-header .svg-icon {
  cursor: pointer;
}
.workspace-header .restart-icon {
  margin: -2px;
}
</style>
