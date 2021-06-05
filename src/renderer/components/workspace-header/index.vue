<template>
  <div class="workspace-header" @dblclick="handleDbClick">
    <div class="logo-wrapper">
      <img class="logo" src="static/256x256.png" draggable="false" />
    </div>
    <div class="header-toolbar">
      <div class="tool-icon-wrapper" v-if="!proxyServerStatus">
        <div class="icon-wrapper" title="启动代理" @click.prevent.stop="startProxyServer" @dblclick.prevent.stop="()=>{}">
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
        <div class="icon-wrapper" title="停止代理" @click.prevent.stop="stopProxyServer" @dblclick.prevent.stop="()=>{}">
          <svgicon
            slot="reference"
            v-if="isOnline"
            class="stop-icon"
            icon="stop"
            width="16" height="16" color="red"
          ></svgicon>
        </div>
        <div class="icon-wrapper" title="重启代理" @click.prevent.stop="restartProxyServer" @dblclick.prevent.stop="()=>{}">
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
        <div class="icon-wrapper" title="代理设置" @click.prevent.stop="showProxySetting" @dblclick.prevent.stop="()=>{}">
          <svgicon
            slot="reference"
            v-if="isOnline"
            class="settings-icon"
            icon="settings"
            width="16" height="16" color="#666"
          ></svgicon>
        </div>
        <div class="icon-wrapper" title="vconsole 设置" @click.prevent.stop="showVconsoleSetting" @dblclick.prevent.stop="()=>{}">
          <svgicon
            slot="reference"
            v-if="isOnline"
            class="vconsole-icon"
            icon="vconsole"
            width="16" height="16" color="#666"
          ></svgicon>
        </div>
        <div class="icon-wrapper" title="weinre 设置" @click.prevent.stop="showWeinreSetting" @dblclick.prevent.stop="()=>{}">
          <svgicon
            slot="reference"
            v-if="isOnline"
            class="weinre-icon"
            icon="weinre"
            width="12" height="12" color="#666"
          ></svgicon>
        </div>
      </div>
      <div class="tool-icon-wrapper" v-if="!ruleEditMode">
        <el-popover
          title="本机IP"
          width="200"
          trigger="click"
          :content="`${ipAddress}`"
        >
          <div title="本机IP" class="icon-wrapper" slot="reference">
            <svgicon
              v-if="isOnline"
              class="online-icon"
              icon="online"
              width="16" height="16" color="#67c23a"
            ></svgicon>
            <svgicon
              v-if="!isOnline"
              class="offline-icon"
              icon="offline"
              width="16" height="16" color="#e2210d"
            ></svgicon>
          </div>
        </el-popover>
        <el-popover
          v-if="showCertQr"
          width="200"
          trigger="click"
        >
          <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <qrcode :value="certUrl" :options="{ size: 150, foreground: '#333'}"></qrcode>
            <span style="margin-top: 12px; color: #3A8EE8; cursor: pointer;" @click="downloadCert">点击下载HTTPS证书</span>
            <span style="margin-top: 8px; color: #3A8EE8; cursor: pointer;" @click="openCertFolder">打开本地证书目录</span>
          </div>
          <div title="HTTPS证书" class="icon-wrapper" slot="reference">
            <svgicon
              class="qrcode-icon"
              icon="qrcode"
              width="16" height="16" color="#333"
            ></svgicon>
          </div>
        </el-popover>
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
import WindowBtnGroup from '@/components/common/window-btn-group'
import {showLoading, closeLoading} from '@/components/common/loading'
import showNotification from '@/utils/show-notification'

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
      ruleEditMode: 'getRuleEditMode'
    }),
    isOnline () {
      return this.ipAddress !== '127.0.0.1'
    },
    showCertQr () {
      return this.proxyServerStatus && this.proxyConfig && this.proxyConfig.forceProxyHttps
    },
    certUrl () {
      return `http://${this.ipAddress}:${this.proxyConfig.webPort}/getRootCA`
    }
  },
  methods: {
    startProxyServer (e) {
      showLoading()
      this.$proxyApi.resetHookData()
      this.$proxyApi.resetProxyServerLog()
      const proxyConfig = this.$proxyApi.generateProxyConfig()
      this.$proxyApi.startProxyServer(proxyConfig).then((data) => {
        showNotification('提示', {
          body: '代理服务器启动',
          tag: 'simple-notification'
        },
        4000)
        closeLoading()
      }, (e) => {
        showNotification('错误信息', {
          body: e.message,
          tag: 'simple-notification'
        },
        4000)
        closeLoading()
      })
    },
    stopProxyServer () {
      showLoading()
      this.$proxyApi.stopProxyServer().then((data) => {
        showNotification('提示', {
          body: '代理服务器关闭',
          tag: 'simple-notification'
        },
        4000)
        closeLoading()
      })
    },
    restartProxyServer () {
      showLoading()
      this.$proxyApi.resetHookData()
      this.$proxyApi.resetProxyServerLog()
      const proxyConfig = this.$proxyApi.generateProxyConfig()
      this.$proxyApi.restartProxyServer(proxyConfig).then((data) => {
        showNotification('提示', {
          body: '代理服务器已重启',
          tag: 'simple-notification'
        },
        4000)
        closeLoading()
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
      this.$ipcRenderer.send('window-fullscreen')
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
    this.$ipcRenderer.removeListener('proxy-server-status-updated', this.proxyServerStatusUpdateHanlder)
  },
  components: {
    WindowBtnGroup
  }
}
</script>

<style lang="less" scoped>
.workspace-header {
  display: flex;
  align-items: center;
  height: 44px;
  line-height: 44px;
  background: -webkit-linear-gradient(top, #eee, #bbb);
  -webkit-app-region: drag;

  .logo-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.7);
    padding: 6px;
    margin: 0 10px;
    user-select: none;

    .logo {
      width: 20px;
      height: 20px;
    }
  }

  .header-toolbar {
    flex: 1;
    justify-content: flex-end;
    display: inline-flex;

    .tool-icon-wrapper {
      background-color: #fff;
      border-radius: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 40px;
      overflow: hidden;
      -webkit-app-region: no-drag;

      .icon-wrapper {
        height: 28px;
        line-height: 32px;
        padding: 0 12px;
        cursor: pointer;
      }
      .icon-wrapper:active {
        background-color: #efefef;
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
    }
  }

  .window-btn-group {
    margin: 0 12px;
  }
}
</style>
