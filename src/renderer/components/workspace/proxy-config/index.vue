<template>
  <div class="proxy-config" v-loading.fullscreen="loading">
    <div class="operation-btn-group">
      <div class="icon-wrapper" v-if="proxyServerStatus === 0" @click="startProxyServer">
        <svgicon
          class="start-icon"
          icon="start" width="36" height="36" color="#67c23a"
        ></svgicon>
        启动代理
      </div>
      <div class="icon-wrapper" v-if="proxyServerStatus === 1" @click="restartProxyServer">
        <svgicon
          class="restart-icon"
          icon="restart"
          width="44" height="44" color="#67c23a"
        ></svgicon>
        重启代理
      </div>
      <div class="icon-wrapper" v-if="proxyServerStatus === 1" @click="stopProxyServer">
        <svgicon
          class="stop-icon"
          icon="stop"
          width="36" height="36" color="red"
        ></svgicon>
        关闭代理
      </div><div class="icon-wrapper" v-if="proxyServerStatus === 1" @click="openNetworkData">
        <svgicon
          class="browser-icon"
          icon="browser"
          width="32" height="32" color="#409EFF"
        ></svgicon>
        网络数据
      </div>
      <div class="icon-wrapper" v-if="proxyServerStatus === 0" @click="showProxyConfigSetting = true">
        <svgicon
          class="settings-icon"
          icon="settings"
          width="38" height="38" color="#606266"
        ></svgicon>
        代理配置
      </div>
      <div class="icon-wrapper" v-if="proxyServerStatus === 0" @click="getRootCA">
        <svgicon
          class="certificate-icon"
          icon="certificate"
          width="30" height="30" color="#3a8ee6"
        ></svgicon>
        HTTPS证书
      </div>
      <div class="icon-wrapper" @click="showVconsoleSetting = true">
        <svgicon
          class="vconsole-icon"
          icon="vconsole"
          width="34" height="34" color="#909399"
        ></svgicon>
        vconsole配置
      </div>
      <div class="icon-wrapper" @click="showWeinreConfigSetting = true">
        <svgicon
          class="weinre-icon"
          icon="weinre"
          width="30" height="30" color="#606266"
        ></svgicon>
        weinre配置
      </div>
    </div>
    <div class="info-container">
      <el-tabs class="proxy-server-info-tab" v-model="infoTab" v-if="proxyServerStatus === 0" type="border-card">
        <el-tab-pane label="代理配置信息" name="proxy-config-info">
          <div class="proxy-config-info-wrapper">
            <div class="proxy-config-info">
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
                  {{networkSpeedValue}}
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
          </div>
        </el-tab-pane>
        <el-tab-pane label="Weinre日志" name="weinre-data" v-if="weinreServerStatus === 1">
          <weinre-data-tab />
        </el-tab-pane>
      </el-tabs>
      <el-tabs class="proxy-server-data-tab" v-model="dataTab" v-if="proxyServerStatus === 1" type="border-card">
        <el-tab-pane label="网络数据" name="proxy-server-record">
          <proxy-server-record />
        </el-tab-pane>
        <el-tab-pane label="命中规则数据" name="proxy-server-data">
          <proxy-server-data />
        </el-tab-pane>
        <el-tab-pane name="proxy-server-log">
          <span slot="label" style="display: flex; align-items: center;">
            代理服务器日志
            <span class="proxy-server-log-number" v-if="proxyServerLogNumber > 0">
              {{proxyServerLogNumber}}
            </span>
          </span>
          <proxy-server-log />
        </el-tab-pane>
        <el-tab-pane label="Weinre日志" name="weinre-data" v-if="weinreServerStatus === 1">
          <weinre-data-tab />
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
    <el-dialog
      title="weinre配置"
      :visible.sync="showWeinreConfigSetting"
      :append-to-body="true"
      width="60%"
     >
      <weinre-config-dialog @cancelWeinreConfig="showWeinreConfigSetting = false" />
    </el-dialog>
    <el-dialog
      title="vconsole配置"
      :visible.sync="showVconsoleSetting"
      :append-to-body="true"
      width="60%"
     >
      <vconsole-config-dialog @cancelVconsoleConfig="showVconsoleSetting = false" />
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
import '@/assets/icons/weinre'
import '@/assets/icons/vconsole'
import ProxyConfigDialog from './proxy-config-dialog'
import WeinreConfigDialog from './weinre-config-dialog'
import VconsoleConfigDialog from './vconsole-config-dialog'
import ProxyServerData from './proxy-server-data'
import ProxyServerLog from './proxy-server-log'
import ProxyServerRecord from './proxy-server-record'
import WeinreDataTab from './weinre-data-tab'
import events from '@/configs/events'
import eventBus from '@/utils/event-bus'
import { networkSpeed } from '@/configs/constants'

export default {
  data () {
    return {
      showProxyConfigSetting: false,
      showWeinreConfigSetting: false,
      showVconsoleSetting: false,
      loading: false,
      dataTab: 'proxy-server-record',
      infoTab: 'proxy-config-info',
      proxyServerLogNumber: 0
    }
  },
  computed: {
    ...mapGetters({
      proxyServerStatus: 'getProxyServerStatus',
      weinreServerStatus: 'getWeinreServerStatus',
      proxyConfig: 'getProxyConfig'
    }),
    networkSpeedValue () {
      let val = ''
      if (this.proxyConfig && this.proxyConfig.throttle) {
        const found = networkSpeed.find((item) => {
          return item.value === this.proxyConfig.throttle
        })
        if (found) {
          val = found.label
        }
      }
      return val
    }
  },
  watch: {
    proxyConfig: {
      deep: true,
      handler (val) {
        this.$proxyApi.writeProxyConfig(val)
      }
    },
    weinreServerStatus (val) {
      if (val === 1) {
        this.dataTab = 'weinre-data'
        this.infoTab = 'weinre-data'
      } else {
        this.dataTab = 'proxy-server-record'
        this.infoTab = 'proxy-config-info'
      }
    }
  },
  mounted () {
    const proxyConfig = this.$proxyApi.readProxyConfig()
    this.$store.commit('setProxyConfig', proxyConfig)
    eventBus.$on(events.UPDATE_PROXY_SERVER_LOG_COUNT, (errNumber) => {
      this.proxyServerLogNumber = errNumber
    })
  },
  beforeDestroy () {
    eventBus.$off(events.UPDATE_PROXY_SERVER_LOG_COUNT)
  },
  methods: {
    startProxyServer () {
      this.loading = true
      this.$proxyApi.resetHookData()
      this.$proxyApi.resetProxyServerLog()
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
      this.$proxyApi.resetHookData()
      this.$proxyApi.resetProxyServerLog()
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
    WeinreConfigDialog,
    VconsoleConfigDialog,
    ProxyServerData,
    ProxyServerLog,
    ProxyServerRecord,
    WeinreDataTab
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
  border-right: 1px solid #ccc;
  user-select: none;
}
.proxy-config .operation-btn-group .icon-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 110px;
  height: 60px;
  margin: 12px;
  padding: 4px;
  border: 1px solid #d7d7d7;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.proxy-config .info-container {
  flex: 1;
  overflow: hidden;
}
.proxy-config .info-container .proxy-server-info-tab {
  width: 100%;
  height: 100%;
  border: none;
}
.proxy-config .info-container .proxy-config-info-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.proxy-config .info-container .proxy-config-info-wrapper .proxy-config-info {
  display: inline-block;
}
.proxy-config .info-container .proxy-config-info-wrapper .proxy-config-info .proxy-config-item {
  height: 36px;
  line-height: 36px;
}
.proxy-config .info-container .proxy-config-info-wrapper .proxy-config-info .proxy-config-item .label {
  display: inline-block;
  width: 180px;
  font-weight: bold;
}
.proxy-config .info-container .proxy-config-info-wrapper .proxy-config-info .proxy-config-item .content {
  display: inline-block;
}
.proxy-config .info-container .proxy-server-data-tab {
  width: 100%;
  height: 100%;
  border: none;
}
.restart-icon {
  margin: -2px;
}
.proxy-server-log-number {
  background-color: #66b1ff;
  border-radius: 10px;
  color: #fff;
  display: inline-block;
  font-size: 12px;
  height: 16px;
  line-height: 16px;
  padding: 0 6px;
  text-align: center;
  white-space: nowrap;
  border: 1px solid #fff;
  margin-left: 6px;
}
</style>
