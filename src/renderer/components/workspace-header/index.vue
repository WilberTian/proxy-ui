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
      @click="showProxyConfigSetting = true"
    ></svgicon>
    <svgicon
      v-if="proxyServerStatus === 0"
      class="certificate-icon"
      icon="certificate"
      width="22" height="22" color="#333"
      @click="getRootCA"
    ></svgicon>
    <el-dialog
      title="代理服务器配置"
      :visible.sync="showProxyConfigSetting"
      width="60%"
     >
      <proxy-config :proxyConfig="proxyConfig" @submitProxyConfig="handleSubmitProxyConfig"
      @cancelProxyConfig="showProxyConfigSetting = false"/>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import '@/assets/icons/start'
import '@/assets/icons/stop'
import '@/assets/icons/restart'
import '@/assets/icons/settings'
import '@/assets/icons/certificate'
import ProxyConfig from './proxy-config'

export default {
  data () {
    return {
      showProxyConfigSetting: false
    }
  },
  computed: {
    ...mapGetters({
      proxyServerStatus: 'getProxyServerStatus',
      proxyConfig: 'getProxyConfig'
    })
  },
  mounted () {
    const proxyConfig = this.$proxyApi.readProxyConfig()
    this.$store.commit('setProxyConfig', proxyConfig)
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
        this.$store.commit('setProxyServerStatus', 1)
      }, (e) => {
        this.$notify({
          title: '错误信息',
          message: e.message,
          type: 'error'
        })
        this.$store.commit('setProxyServerStatus', 0)
      })
    },
    stopProxyServer () {
      this.$proxyApi.stopProxyServer().then((data) => {
        this.$notify({
          title: '提示',
          message: data.msg,
          type: 'success'
        })
        this.$store.commit('setProxyServerStatus', 0)
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
        this.$store.commit('setProxyServerStatus', 1)
      })
    },
    handleSubmitProxyConfig (proxyConfig) {
      this.$store.commit('setProxyConfig', proxyConfig)
    },
    getRootCA () {
      this.$proxyApi.getRootCA()
    }
  },
  components: {
    ProxyConfig
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
