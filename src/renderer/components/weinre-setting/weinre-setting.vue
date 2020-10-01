
<template>
  <div class="wei nre-setting">
    <div class="weinre-setting-header">
      <div class="header-content">
        weinre 设置
      </div>
      <window-btn-group @close="handleClose" disableMinimize disableMaximize />
    </div>
    <el-form
      class="weinre-config-form"
      :model="weinreConfigData"
      :rules="validators"
      ref="weinreConfigForm"
      label-width="120px"
      size="mini"
    >
      <el-form-item
        label="weinre端口"
        prop="port"
        
      >
        <el-input v-model.number="weinreConfigData.port" :disabled="weinreServerStatus"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="startWeinre('weinreConfigForm')"
          v-if="!weinreServerStatus"
        >开启weinre</el-button>
        <el-button v-if="weinreServerStatus" @click="stopWeinre">关闭weinre</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import WindowBtnGroup from '../common/window-btn-group'
import showNotification from '@/utils/show-notification'

export default {
  data () {
    const isValidPort = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请填写weinre端口'))
      }
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('请输入数字值'))
        } else {
          if (value <= 1024) {
            callback(new Error('请输入大于1024的数字'))
          }
          callback()
        }
      }, 500)
    }

    return {
      weinreConfigData: {...this.weinreConfig},
      weinreServerStatus: false,
      validators: {
        port: [
          { validator: isValidPort, trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    weinreConfigData: {
      deep: true,
      handler (val) {
        this.$proxyApi.writeWeinreConfig(val)
      }
    }
  },
  beforeCreate () {
    this.weinreConfig = this.$proxyApi.readWeinreConfig()
  },
  mounted () {
    this.weinreStatusUpdateHandler = () => {
      this.weinreServerStatus = this.$proxyApi.getWeinreStatus()
    }
    this.$ipcRenderer.on('weinre-status-updated', this.weinreStatusUpdateHandler)
    this.weinreStatusUpdateHandler()
  },
  beforeDestroy () {
    this.$ipcRenderer.removeListener('weinre-status-updated', this.weinreStatusUpdateHandler)
  },
  methods: {
    startWeinre (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$proxyApi.startWeinre().then((data) => {
            showNotification('提示', {
              body: data,
              tag: 'simple-notification'
            },
            4000)
          }, (e) => {
            showNotification('错误提示', {
              body: e.message,
              tag: 'simple-notification'
            },
            4000)
          })
        } else {
          return false
        }
      })
    },
    stopWeinre () {
      this.$proxyApi.stopWeinre().then((data) => {
        showNotification('提示', {
          body: data,
          tag: 'simple-notification'
        },
        4000)
      }, (e) => {
        console.log(e)
      })
    },
    handleCancel () {
      this.handleClose()
    },
    handleClose () {
      this.$ipcRenderer.send('weinre-setting-close')
    }
  },
  components: {
    WindowBtnGroup
  }
}
</script>
<style scoped>
.weinre-setting {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.weinre-setting-header {
  display: flex;
  align-items: center;
  height: 24px;
  min-height: 24px;
  padding: 0 8px;
}
.weinre-setting-header .header-content {
  flex: 1;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  text-align: center;
}
.weinre-config-form {
  padding: 16px;
}
</style>