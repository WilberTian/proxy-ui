<template>
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
      <el-button v-else class="button-new-tag" size="small" @click="showTagInput">+ 添加</el-button>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="submitForm('proxyConfigForm')"
      >保存</el-button>
      <el-button @click="resetForm('proxyConfigForm')">重置</el-button>
      <el-button @click="() => {this.$emit('cancelProxyConfig')}">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { networkSpeed } from '@/configs/constants'

export default {
  props: {
    proxyConfig: {
      type: Object
    }
  },
  beforeCreate () {
    this.networkSpeed = networkSpeed
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
          this.$emit('submitProxyConfig', JSON.parse(JSON.stringify(this.proxyConfigData)))
        } else {
          return false
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
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
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
}
</style>
