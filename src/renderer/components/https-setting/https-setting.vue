
<template>
  <div class="https-setting">
    <div class="https-setting-header">
      <div class="header-content">
        HTTPS设置
      </div>
      <window-btn-group @close="handleClose" disableMinimize disableMaximize />
    </div>
    <div class="host-input-wrapper">
      <el-input size="mini" style="margin-right: 20px;" v-model="hostToAdd" placeholder="请输入要支持HTTPS域名" />
      <el-button type="primary" size="mini" @click="enableHttps4Host" :disabled="!hostToAdd.trim()">添加</el-button>
    </div>
    <div class="info-label">
      已支持HTTPS的域名
    </div>
    <div class="host-list">
      <div class="host-item" v-for="(host, idx) in hostsEnalbedHttps" :key="idx">
        <div class="host-item-label">
          {{host}}
        </div>
        <div class="icon-wrapper">
          <i class="el-icon-error" @click="disableHttps4Host(host)"></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import WindowBtnGroup from '../common/window-btn-group'

export default {
  data () {
    return {
      hostToAdd: '',
      hostsEnalbedHttps: []
    }
  },
  mounted () {
    this.httpsHostUpdated = () => {
      this.hostsEnalbedHttps = this.$proxyApi.getHostsEnabledHttps()
    }
    this.$ipcRenderer.on('https-host-updated', this.httpsHostUpdated)
    this.httpsHostUpdated()
  },
  beforeDestroy () {
    this.$ipcRenderer.removeListener('https-host-updated', this.httpsHostUpdated)
  },
  methods: {
    handleClose () {
      this.$ipcRenderer.send('https-setting-close')
    },
    enableHttps4Host () {
      this.$proxyApi.enableHttps4Host(this.hostToAdd)
      this.hostToAdd = ''
    },
    disableHttps4Host (host) {
      this.$proxyApi.disableHttps4Host(host)
    }
  },
  components: {
    WindowBtnGroup
  }
}
</script>
<style scoped>
.https-setting {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.https-setting-header {
  display: flex;
  align-items: center;
  height: 24px;
  min-height: 24px;
  padding: 0 8px;
  background: -webkit-linear-gradient(top, #eee, #bbb);
}
.https-setting-header .header-content {
  flex: 1;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  text-align: center;
}
.host-input-wrapper {
  display: flex;
  justify-content: space-between;
  margin: 12px;
}
.info-label {
  margin: 0 12px;
  font-size: 12px;
  font-weight: bold;
  color: #333;
}
.host-list {
  margin: 0 12px 12px 12px;
  flex: 1;
  border: 1px solid #ccc;
  overflow-y: auto;
}
.host-list .host-item {
  height: 24px;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}
.host-list .host-item .host-item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
  font-size: 12px;
}
.host-list .host-item .icon-wrapper {
  width: 20px;
  display: flex;
}
.host-list .host-item .icon-wrapper i {
  cursor: pointer;
}
</style>