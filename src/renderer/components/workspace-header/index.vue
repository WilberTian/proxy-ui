<template>
  <div class="workspace-header" @dblclick="handleDbClick">
    <div class="logo-wrapper">
      <img class="logo" src="static/256x256.png" draggable="false" />
    </div>
    <div class="header-toolbar">
      <div class="tool-icon-wrapper" v-if="!proxyServerStatus">
        <div class="icon-wrapper" title="启动代理" @click="startProxyServer">
          <svgicon
            slot="reference"
            v-if="isOnline"
            class="start-icon"
            icon="start"
            width="16" height="16" color="#67c23a"
          ></svgicon>
        </div>
      </div>
      <div class="tool-icon-wrapper" v-if="proxyServerStatus">
        <div class="icon-wrapper" title="停止代理" @click="stopProxyServer">
          <svgicon
            slot="reference"
            v-if="isOnline"
            class="stop-icon"
            icon="stop"
            width="16" height="16" color="red"
          ></svgicon>
        </div>
        <div class="icon-wrapper" title="重启代理" @click="restartProxyServer">
          <svgicon
            slot="reference"
            v-if="isOnline"
            class="restart-icon"
            icon="restart"
            width="20" height="20" color="#67c23a"
          ></svgicon>
        </div>
      </div>
      <div class="tool-icon-wrapper">
        <div class="icon-wrapper" title="代理设置" @click="showProxySetting">
          <svgicon
            slot="reference"
            v-if="isOnline"
            class="settings-icon"
            icon="settings"
            width="16" height="16" color="#606266"
          ></svgicon>
        </div>
        <div class="icon-wrapper" title="新建代理规则" @click="showProxyRuleSetting">
          <svgicon
            slot="reference"
            v-if="isOnline"
            class="filter-icon"
            icon="filter"
            width="14" height="14" color="#333"
          ></svgicon>
        </div>
        <div class="icon-wrapper" title="vconsole 设置" @click="showVconsoleSetting">
          <svgicon
            slot="reference"
            v-if="isOnline"
            class="vconsole-icon"
            icon="vconsole"
            width="16" height="16" color="#909399"
          ></svgicon>
        </div>
        <div class="icon-wrapper" title="weinre 设置" @click="showWeinreSetting">
          <svgicon
            slot="reference"
            v-if="isOnline"
            class="weinre-icon"
            icon="weinre"
            width="12" height="12" color="#606266"
          ></svgicon>
        </div>
      </div>
      <div class="tool-icon-wrapper" v-if="currentStep === 2 && !ruleEditMode">
        <div class="icon-wrapper">
          <el-popover
            title="本机IP"
            width="200"
            trigger="hover"
            :content="`${ipAddress}`"
          >
            <svgicon
              slot="reference"
              v-if="isOnline"
              class="online-icon"
              icon="online"
              width="16" height="16" color="#67c23a"
            ></svgicon>
            <svgicon
              slot="reference"
              v-if="!isOnline"
              class="offline-icon"
              icon="offline"
              width="16" height="16" color="#e2210d"
            ></svgicon>
          </el-popover>
        </div>
        <div class="icon-wrapper" v-if="showCertQr">
          <el-popover
            width="200"
            trigger="hover"
          >
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <qrcode :value="certUrl" :options="{ size: 150, foreground: '#333'}"></qrcode>
              <span style="margin-top: 12px; color: #3A8EE8; cursor: pointer;" @click="downloadCert">点击下载HTTPS证书</span>
              <span style="margin-top: 8px; color: #3A8EE8; cursor: pointer;" @click="openCertFolder">打开本地证书目录</span>
            </div>
            <svgicon
              slot="reference"
              class="qrcode-icon"
              icon="qrcode"
              width="16" height="16" color="#333"
            ></svgicon>
          </el-popover>
        </div>
      </div>
    </div>
    <window-btn-group @close="handleClose" @minimize="handleMinimize" @maximize="handleMaximize" />
  </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import VueQrcode from '@xkeshi/vue-qrcode'
import '@/assets/icons/start'
import '@/assets/icons/stop'
import '@/assets/icons/restart'
import '@/assets/icons/settings'
import '@/assets/icons/weinre'
import '@/assets/icons/vconsole'
import '@/assets/icons/filter'
import '@/assets/icons/online'
import '@/assets/icons/offline'
import '@/assets/icons/qrcode'
import WindowBtnGroup from '../common/window-btn-group'

Vue.component(VueQrcode.name, VueQrcode)

export default {
  data () {
    return {
      ipAddress: '127.0.0.1',
      proxyServerStatus: false
    }
  },
  computed: {
    ...mapGetters({
      proxyConfig: 'getProxyConfig',
      currentStep: 'getCurrentStep',
      ruleEditMode: 'getRuleEditMode'
    }),
    isOnline () {
      return this.ipAddress !== '127.0.0.1'
    },
    showCertQr () {
      return this.proxyServerStatus && this.proxyConfig && this.proxyConfig.forceProxyHttps
    },
    certUrl () {
      return `http://${this.ipAddress}:${this.proxyConfig.webInterface.webPort}/fetchCrtFile`
    }
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
        // this.$store.commit('setWorkspaceFooterVisible', false)
        this.loading = false
      }, (e) => {
        this.$notify({
          title: '错误信息',
          message: e.message,
          type: 'error'
        })
        this.$store.commit('setProxyServerStatus', 0)
        // this.$store.commit('setWorkspaceFooterVisible', true)
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
        // this.$store.commit('setWorkspaceFooterVisible', true)
        this.loading = false
        this.$proxyApi.setTrayTitle('')
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
        // this.$store.commit('setWorkspaceFooterVisible', false)
        this.loading = false
      })
    },
    showProxySetting () {
      this.$ipcRenderer.send('show-proxy-setting-window')
    },
    showProxyRuleSetting () {
      this.$ipcRenderer.send('show-proxy-rule-window')
    },
    showVconsoleSetting () {
      this.$ipcRenderer.send('show-vconsole-setting-window')
    },
    showWeinreSetting () {
      this.$ipcRenderer.send('show-weinre-setting-window')
    },
    handleDbClick () {
      this.$ipcRenderer.send('window-maximize')
    },
    downloadCert () {
      this.$shell.openExternal(this.certUrl)
    },
    openCertFolder () {
      this.$proxyApi.getRootCA()
    },
    handleClose () {
      this.$ipcRenderer.send('window-close')
    },
    handleMinimize () {
      this.$ipcRenderer.send('window-minimize')
    },
    handleMaximize () {
      this.$ipcRenderer.send('window-maximize')
    }
  },
  mounted () {
    this.ipAddressUpdateHandler = () => {
      this.ipAddress = this.$proxyApi.getIPAddress()
    }
    this.$ipcRenderer.on('ip-address-updated', this.ipAddressUpdateHandler)
    this.ipAddressUpdateHandler()

    this.proxyServerStatusUpdateHanlder = () => {
      this.proxyServerStatus = this.$proxyApi.getPoxyServerStatus()
    }
    this.$ipcRenderer.on('proxy-server-status-updated', this.proxyServerStatusUpdateHanlder)
    this.proxyServerStatusUpdateHanlder()
  },
  beforeDestroy () {

  },
  components: {
    WindowBtnGroup
  }
}
</script>

<style scoped>
.workspace-header {
  display: flex;
  align-items: center;
  height: 48px;
  line-height: 48px;
  background: -webkit-linear-gradient(top, #eee, #bbb);
  -webkit-app-region: drag;
}
.workspace-header .logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  padding: 6px;
  margin: 0 10px;
}
.workspace-header .logo-wrapper .logo {
  width: 20px;
  height: 20px;
}
.workspace-header .header-toolbar {
  flex: 1;
  justify-content: flex-end;
  display: inline-flex;
}
.tool-icon-wrapper {
  background-color: #fff;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 40px;
}
.icon-wrapper {
  height: 28px;
  line-height: 32px;
  padding: 0 12px;
  cursor: pointer;
}
.icon-wrapper:not(:last-child) {
  border-right: 1px solid #efefef;
}
.restart-icon {
  margin: -2px;
}
.weinre-icon {
  margin: 2px;
}
.filter-icon {
  margin: 1px;
}
.window-btn-group {
  margin: 0 12px;
}
.operation-btn {
  height: 26px;
  line-height: 26px;
  padding: 2px 12px;
  margin: 0 12px;
  background: #fff;
  color: #666;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}
</style>
