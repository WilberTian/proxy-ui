
<template>
  <div class="vconsole-setting">
    <div class="vconsole-setting-header">
      <div class="header-content">
        vconsole 设置
      </div>
      <window-btn-group @close="handleClose" disableMinimize disableMaximize />
    </div>
    <div class="vconsole-setting-form">
      <span slot="label">
        vconsole注入
        <el-tooltip class="item" effect="dark" content="开启代理后，html页面中会自动注入vconsole" placement="bottom">
          <i class="el-icon-info"></i>
        </el-tooltip>
      </span>
      <el-radio-group v-model="vsonsoleStatus" @change="vconsoleChangeHandler">
        <el-radio :label="true">开启</el-radio>
        <el-radio :label="false">不开启</el-radio>
      </el-radio-group>
    </div>
  </div>
</template>
<script>
import WindowBtnGroup from '../common/window-btn-group'

export default {
  data () {
    return {
      vsonsoleStatus: false
    }
  },
  mounted () {
    this.vconsoleConfigUpdateHandler = () => {
      this.vsonsoleStatus = !!(this.$proxyApi.readVconsoleConfig().injected)
    }
    this.$ipcRenderer.on('vconsole-config-updated', this.vconsoleConfigUpdateHandler)
    this.vconsoleConfigUpdateHandler()
  },
  beforeDestroy () {
    this.$ipcRenderer.removeListener('vconsole-config-updated', this.vconsoleConfigUpdateHandler)
  },
  methods: {
    handleClose () {
      this.$ipcRenderer.send('vconsole-setting-close')
    },
    vconsoleChangeHandler (value) {
      const vconsoleConfigData = this.$proxyApi.readVconsoleConfig()
      this.$proxyApi.writeVconsoleConfig({
        ...vconsoleConfigData,
        injected: value
      })
    }
  },
  components: {
    WindowBtnGroup
  }
}
</script>
<style scoped>
.vconsole-setting {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.vconsole-setting-header {
  display: flex;
  align-items: center;
  height: 24px;
  min-height: 24px;
  padding: 0 8px;
}
.vconsole-setting-header .header-content {
  flex: 1;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  text-align: center;
}
.vconsole-setting-form {
  padding: 16px;
}
</style>