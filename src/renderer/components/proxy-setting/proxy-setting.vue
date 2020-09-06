<template>
  <div class="proxy-setting">
    <div class="proxy-setting-header">
      <div class="header-content">
        代理设置
      </div>
      <window-btn-group @close="handleClose" disableMinimize disableMaximize />
    </div>
    <el-form
      class="proxy-config-form"
      :model="proxyConfigData"
      :rules="validators"
      ref="proxyConfigForm"
      label-width="120px"
      size="mini"
    >
      <el-form-item
        label="代理服务器端口"
        prop="port"
      >
        <el-input v-model.number="proxyConfigData.port"></el-input>
      </el-form-item>
      <el-form-item
        label="开启HTTPS"
        prop="forceProxyHttps"
      >
        <el-radio-group v-model="proxyConfigData.forceProxyHttps">
          <el-radio :label="true">开启</el-radio>
          <el-radio :label="false">不开启</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="网络速度"
        prop="throttle"
      >
        <el-select v-model="proxyConfigData.throttle" placeholder="请选择">
          <el-option
            v-for="item in networkSpeed"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="数据web端口"
        prop="webInterface.webPort"
      >
        <el-input v-model.number="proxyConfigData.webInterface.webPort"></el-input>
      </el-form-item>
      <el-form-item
        label="开启全局代理"
        prop="enableGlobalProxy"
      >
        <el-radio-group v-model="proxyConfigData.enableGlobalProxy">
          <el-radio :label="true">开启</el-radio>
          <el-radio :label="false">不开启</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="黑名单"
        prop="bypassList"
      >
        <el-tag
          size="medium"
          :key="tag"
          v-for="tag in proxyConfigData.bypassList"
          closable
          :disable-transitions="false"
          @close="handleItemRemove(tag)">
          {{tag}}
        </el-tag>
        <el-input
          class="input-new-tag"
          v-if="tagInputVisible"
          v-model="tagInputValue"
          ref="saveTagInput"
          size="mini"
          @keyup.enter.native="handleTagInputConfirm"
          @blur="handleTagInputConfirm"
        >
        </el-input>
        <el-button v-else class="button-new-tag" icon="el-icon-plus" @click="showTagInput">添加</el-button>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="submitForm('proxyConfigForm')"
        >保存</el-button>
        <el-button @click="resetForm('proxyConfigForm')">重置</el-button>
        <el-button @click="cancelForm">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import WindowBtnGroup from '../common/window-btn-group'
import { networkSpeed } from '@/configs/constants'

export default {
  beforeCreate () {
    this.networkSpeed = networkSpeed
    this.proxyConfig = this.$proxyApi.readProxyConfig()
  },
  data () {
    const isValidPort = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请填写代理服务器端口'))
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
    const isValidThrottle = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请填写网络速度'))
      }
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('请输入数字值'))
        } else {
          if (value <= 0) {
            callback(new Error('请输入大于0的数字'))
          }
          callback()
        }
      }, 500)
    }

    return {
      proxyConfigData: JSON.parse(JSON.stringify(this.proxyConfig)),
      validators: {
        port: [
          { validator: isValidPort, trigger: 'blur' }
        ],
        throttle: [
          { validator: isValidThrottle, trigger: 'blur' }
        ],
        'webInterface.webPort': [
          { validator: isValidPort, trigger: 'blur' }
        ]
      },
      tagInputVisible: false,
      tagInputValue: ''
    }
  },
  methods: {
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // this.$emit('submitProxyConfig', this.proxyConfigData)
          this.$proxyApi.writeProxyConfig(this.proxyConfigData)
          this.handleClose()
        } else {
          return false
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    cancelForm () {
      this.handleClose()
    },
    handleItemRemove (tag) {
      this.proxyConfigData.bypassList.splice(this.proxyConfigData.bypassList.indexOf(tag), 1)
    },
    showTagInput () {
      this.tagInputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleTagInputConfirm () {
      let tagInputValue = this.tagInputValue
      if (tagInputValue) {
        this.proxyConfigData.bypassList.push(tagInputValue)
      }
      this.tagInputVisible = false
      this.tagInputValue = ''
    },
    handleClose () {
      this.$ipcRenderer.send('proxy-setting-close')
    }
  },
  components: {
    WindowBtnGroup
  }
}
</script>

<style scoped>
.proxy-setting {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.proxy-setting-header {
  display: flex;
  align-items: center;
  height: 24px;
  min-height: 24px;
  padding: 0 8px;
}
.proxy-setting-header .header-content {
  flex: 1;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  text-align: center;
}
.proxy-config-form {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}
.el-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
.button-new-tag {
  height: 28px;
  vertical-align: middle;
  font-size: 12px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
}
</style>
