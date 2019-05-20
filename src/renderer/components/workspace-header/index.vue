<template>
  <div class="workspace-header">
    <el-button v-if="proxyServerStatus === 0" type="primary" @click="startProxyServer">Start</el-button>
    <el-button v-if="proxyServerStatus === 1" type="primary" @click="restartProxyServer">Restart</el-button>
    <el-button v-if="proxyServerStatus === 1" type="primary" @click="stopProxyServer">Stop</el-button>
  </div>
</template>

<script>
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
        this.$message({
          message: data.msg,
          type: 'success'
        })
        this.proxyServerStatus = 1
      }, (e) => {
        this.$message({
          message: e.message,
          type: 'error'
        })
        this.proxyServerStatus = 0
      })
    },
    stopProxyServer () {
      this.$proxyApi.stopProxyServer().then((data) => {
        this.$message({
          message: data.msg,
          type: 'success'
        })
        this.proxyServerStatus = 0
      })
    },
    restartProxyServer () {
      const proxyConfig = this.$proxyApi.generateProxyConfig()
      this.$proxyApi.restartProxyServer(proxyConfig).then((data) => {
        this.$message({
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
  height: 60px;
  line-height: 60px;
}
</style>
