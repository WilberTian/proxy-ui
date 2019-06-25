<template>
  <div class="proxy-config" v-loading.fullscreen="loading">
    <div class="operation-btn-group">
      <div class="icon-wrapper" v-if="proxyServerStatus === 0" @click="startProxyServer">
        <svgicon
          class="start-icon"
          icon="start" width="36" height="36" color="#67c23a"
        ></svgicon>
        启动服务器
      </div>
      <div class="icon-wrapper" v-if="proxyServerStatus === 1" @click="restartProxyServer">
        <svgicon
          class="restart-icon"
          icon="restart"
          width="44" height="44" color="#67c23a"
        ></svgicon>
        重启服务器
      </div>
      <div class="icon-wrapper" v-if="proxyServerStatus === 1" @click="stopProxyServer">
        <svgicon
          class="stop-icon"
          icon="stop"
          width="36" height="36" color="red"
        ></svgicon>
        停止服务器
      </div><div class="icon-wrapper" v-if="proxyServerStatus === 1" @click="openNetworkData">
        <svgicon
          class="browser-icon"
          icon="browser"
          width="36" height="36" color="#409EFF"
        ></svgicon>
        打开网络数据
      </div>
      <div class="icon-wrapper" v-if="proxyServerStatus === 0" @click="showProxyConfigSetting = true">
        <svgicon
          class="settings-icon"
          icon="settings"
          width="38" height="38" color="#606266"
        ></svgicon>
        修改配置
      </div>
      <div class="icon-wrapper" v-if="proxyServerStatus === 0" @click="getRootCA">
        <svgicon
          class="certificate-icon"
          icon="certificate"
          width="34" height="34" color="#3a8ee6"
        ></svgicon>
        HTTPS证书
      </div>
    </div>
    <div class="info-container">
      <div class="proxy-config-info" v-if="proxyServerStatus === 0">
        <div class="title">
          代理服务器配置信息
        </div>
        <div class="proxy-config-item">
          <div class="label">
            代理服务器端口
          </div>
          <div class="content">
            {{proxyConfig.port}}
          </div>
        </div>
        <div class="proxy-config-item">
          <div class="label">
            开启HTTPS
          </div>
          <div class="content">
            {{proxyConfig.forceProxyHttps ? '开启' : '未开启'}}
          </div>
        </div>
        <div class="proxy-config-item">
          <div class="label">
            网络速度
          </div>
          <div class="content">
            {{proxyConfig.throttle}}KB
          </div>
        </div>
        <div class="proxy-config-item">
          <div class="label">
            数据web端口
          </div>
          <div class="content">
            {{proxyConfig.webInterface && proxyConfig.webInterface.webPort}}
          </div>
        </div>
        <div class="proxy-config-item">
          <div class="label">
            开启全局代理
          </div>
          <div class="content">
            {{proxyConfig.enableGlobalProxy ? '开启' : '未开启'}}
          </div>
        </div>
      </div>
      <el-tabs class="proxy-server-data-tab" v-model="dataTab" v-if="proxyServerStatus === 1">
        <el-tab-pane label="命中规则数据" name="proxy-server-data">
          <proxy-server-data />
        </el-tab-pane>
        <el-tab-pane label="代理服务器错误" name="proxy-server-error">
          <proxy-server-error />
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-dialog
      title="代理服务器配置"
      :visible.sync="showProxyConfigSetting"
      :append-to-body="true"
      width="60%"
     >
      <proxy-config-dialog :proxyConfig="proxyConfig" @submitProxyConfig="handleSubmitProxyConfig"
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
import '@/assets/icons/browser'
import ProxyConfigDialog from './proxy-config-dialog'
import ProxyServerData from './proxy-server-data'
import ProxyServerError from './proxy-server-error'

export default {
  data () {
    return {
      showProxyConfigSetting: false,
      loading: false,
      dataTab: 'proxy-server-data'
    }
  },
  computed: {
    ...mapGetters({
      proxyServerStatus: 'getProxyServerStatus',
      proxyConfig: 'getProxyConfig'
    })
  },
  watch: {
    proxyConfig: {
      deep: true,
      handler (val) {
        this.$proxyApi.writeProxyConfig(val)
      }
    }
  },
  mounted () {
    const proxyConfig = this.$proxyApi.readProxyConfig()
    this.$store.commit('setProxyConfig', proxyConfig)
  },
  methods: {
    startProxyServer () {
      this.loading = true
      const proxyConfig = this.$proxyApi.generateProxyConfig()
      this.$proxyApi.startProxyServer(proxyConfig).then((data) => {
        this.$notify({
          title: '提示',
          message: data.msg,
          type: 'success'
        })
        this.$store.commit('setProxyServerStatus', 1)
        this.$store.commit('setWorkspaceFooterVisible', false)
        this.loading = false
        this.$proxyApi.resetHookData()
        this.$proxyApi.resetErrorLog()
      }, (e) => {
        this.$notify({
          title: '错误信息',
          message: e.message,
          type: 'error'
        })
        this.$store.commit('setProxyServerStatus', 0)
        this.$store.commit('setWorkspaceFooterVisible', true)
        this.loading = false
      })
    },
    stopProxyServer () {
      this.loading = true
      this.$proxyApi.stopProxyServer().then((data) => {
        this.$notify({
          title: '提示',
          message: data.msg,
          type: 'success'
        })
        this.$store.commit('setProxyServerStatus', 0)
        this.$store.commit('setWorkspaceFooterVisible', true)
        this.loading = false
      })
    },
    restartProxyServer () {
      this.loading = true
      const proxyConfig = this.$proxyApi.generateProxyConfig()
      this.$proxyApi.restartProxyServer(proxyConfig).then((data) => {
        this.$notify({
          title: '提示',
          message: data.msg,
          type: 'success'
        })
        this.$store.commit('setProxyServerStatus', 1)
        this.$store.commit('setWorkspaceFooterVisible', false)
        this.loading = false
        this.$proxyApi.resetHookData()
        this.$proxyApi.resetErrorLog()
      })
    },
    handleSubmitProxyConfig (proxyConfig) {
      this.$store.commit('setProxyConfig', proxyConfig)
      this.showProxyConfigSetting = false
    },
    getRootCA () {
      this.$proxyApi.getRootCA()
    },
    openNetworkData () {
      this.$shell.openExternal(`http://127.0.0.1:${this.proxyConfig.webInterface.webPort}`)
    }
  },
  components: {
    ProxyConfigDialog,
    ProxyServerData,
    ProxyServerError
  }
}
</script>

<style scoped>
.proxy-config {
  display: flex;
}
.proxy-config .operation-btn-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 0 4px #444;
  user-select: none;
}
.proxy-config .operation-btn-group .icon-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 128px;
  height: 60px;
  margin: 12px;
  padding: 8px;
  border: 1px solid #d7d7d7;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.proxy-config .info-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  overflow: hidden;
}
.proxy-config .info-container .proxy-config-info .title {
  font-size: 24px;
  font-weight: bold;
  color: #999;
  margin-bottom: 20px;
}
.proxy-config .info-container .proxy-config-info .proxy-config-item {
  height: 36px;
  line-height: 36px;
}
.proxy-config .info-container .proxy-config-info .proxy-config-item .label {
  display: inline-block;
  width: 160px;
  font-weight: bold;
}
.proxy-config .info-container .proxy-config-info .proxy-config-item .content {
  display: inline-block;
}
.proxy-config .info-container .proxy-server-data-tab {
  width: 100%;
  height: 100%;
  margin: 0 4px;
  overflow: auto;
}
.restart-icon {
  margin: -2px;
}
</style>
