<template>
  <div class="workspace-header" @dblclick="handleDbClick">
    <div class="logo-wrapper">
      <img class="logo" src="static/256x256.png" />
    </div>
    <div class="header-toolbar">
      <div class="tool-icon-wrapper" v-if="currentStep === 2 && !ruleSettingVisible">
        <div class="online-status">
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
        <div class="cert-qr-code" v-if="showCertQr">
          <el-popover
            width="200"
            trigger="hover"
          >
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <qrcode :value="certUrl" :options="{ size: 150, foreground: '#409EFF'}"></qrcode>
              <span style="margin-top: 12px; color: #409EFF; cursor: pointer;" @click="downloadCert">点击下载HTTPS证书</span>
              <span style="margin-top: 8px; color: #409EFF; cursor: pointer;" @click="openCertFolder">打开本地证书目录</span>
            </div>
            <svgicon
              slot="reference"
              class="qrcode-icon"
              icon="qrcode"
              width="16" height="16" color="#67c23a"
            ></svgicon>
          </el-popover>
        </div>
      </div>
      <rule-config-toolbar v-if="currentStep === 1 && !ruleSettingVisible" />
    </div>
    <window-btn-group />
  </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import VueQrcode from '@xkeshi/vue-qrcode'
import '@/assets/icons/online'
import '@/assets/icons/offline'
import '@/assets/icons/qrcode'
import WindowBtnGroup from './window-btn-group'
import RuleConfigToolbar from '../workspace/rule-config/rule-config-toolbar'

Vue.component(VueQrcode.name, VueQrcode)

export default {
  data () {
    return {
      ipAddress: '127.0.0.1'
    }
  },
  computed: {
    ...mapGetters({
      proxyServerStatus: 'getProxyServerStatus',
      proxyConfig: 'getProxyConfig',
      currentStep: 'getCurrentStep',
      ruleSettingVisible: 'getRuleSettingVisible'
    }),
    isOnline () {
      return this.ipAddress !== '127.0.0.1'
    },
    showCertQr () {
      return this.proxyServerStatus === 1 && this.proxyConfig && this.proxyConfig.forceProxyHttps
    },
    certUrl () {
      return `http://${this.ipAddress}:${this.proxyConfig.webInterface.webPort}/fetchCrtFile`
    }
  },
  methods: {
    handleDbClick () {
      this.$ipcRenderer.send('window-maximize')
    },
    downloadCert () {
      this.$shell.openExternal(this.certUrl)
    },
    openCertFolder () {
      this.$proxyApi.getRootCA()
    }
  },
  mounted () {
    this.ipAddressUpdateListener = () => {
      this.ipAddress = this.$proxyApi.getIPAddress()
    }
    this.$ipcRenderer.on('ip-address-updated', this.ipAddressUpdateListener)
    this.ipAddressUpdateListener()
  },
  components: {
    WindowBtnGroup,
    RuleConfigToolbar
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
  display: inline-flex;
  justify-content: flex-end;
}
.tool-icon-wrapper {
  background-color: #fff;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
}
.online-status, .cert-qr-code {
  height: 28px;
  line-height: 32px;
  margin: 0 12px;
  cursor: pointer;
}
.window-btn-group {
  margin: 0 12px;
}
</style>
