<template>
  <div class="workspace-header" @dblclick="handleDbClick">
    <div class="logo">
      Proxy UI
    </div>
    <div class="tool-icon-wrapper">
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
            <qrcode :value="certUrl" :options="{ size: 150, foreground: '#3f51b5'}"></qrcode>
            <span style="margin-top: 12px; color: #3f51b5; cursor: pointer;" @click="downloadCert">点击下载HTTPS证书</span>
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
      proxyConfig: 'getProxyConfig'
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
  background: #3f51b5;
  -webkit-app-region: drag;
}
.workspace-header .logo {
  flex: 1;
  color: #fff;
  font-weight: bold;
  padding: 0 12px;
  user-select: none;
}
.tool-icon-wrapper {
  background-color: rgba(16, 25, 72, 0.3);
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
