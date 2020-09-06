
<template>
  <div class="cache-setting">
    <div class="cache-setting-header">
      <div class="header-content">
        缓存设置
      </div>
      <window-btn-group @close="handleClose" disableMinimize disableMaximize />
    </div>
    <div class="host-input-wrapper">
      <el-input size="mini" style="margin-right: 20px;" v-model="hostToAdd" placeholder="请输入要禁用缓存的域名" />
      <el-button type="primary" size="mini" @click="disableCache4Host" :disabled="!hostToAdd.trim()">添加</el-button>
    </div>
    <div class="info-label">
      已禁用缓存的域名
    </div>
    <div class="host-list">
      <div class="host-item" v-for="(host, idx) in hostsDisableCache" :key="idx">
        <div class="host-item-label">
          {{host}}
        </div>
        <div class="icon-wrapper">
          <i class="el-icon-error" @click="removeHostFromHostsDisableCache(host)"></i>
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
      hostsDisableCache: []
    }
  },
  mounted () {
    this.disableCacheUpdated = () => {
      console.log(this.$proxyApi.getHostsDisableCache())
      this.hostsDisableCache = this.$proxyApi.getHostsDisableCache()
    }
    this.$ipcRenderer.on('disable-cache-updated', this.disableCacheUpdated)
    this.disableCacheUpdated()
  },
  beforeDestroy () {
    this.$ipcRenderer.removeListener('disable-cache-updated', this.disableCacheUpdated)
  },
  methods: {
    handleClose () {
      this.$ipcRenderer.send('cache-setting-close')
    },
    disableCache4Host () {
      this.$proxyApi.disableCache4Host(this.hostToAdd)
      this.hostToAdd = ''
    },
    removeHostFromHostsDisableCache (host) {
      this.$proxyApi.removeHostFromHostsDisableCache(host)
    }
  },
  components: {
    WindowBtnGroup
  }
}
</script>
<style scoped>
.cache-setting {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.cache-setting-header {
  display: flex;
  align-items: center;
  height: 24px;
  min-height: 24px;
  padding: 0 8px;
}
.cache-setting-header .header-content {
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
.host-list .host-item:nth-child(2n+1) {
  background-color: #d7d7d7;
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