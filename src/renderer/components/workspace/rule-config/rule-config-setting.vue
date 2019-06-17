<template>
  <el-form
    class="rule-config-setting"
    :model="ruleConfigData"
    :rules="validators"
    ref="ruleConfigForm"
    label-width="120px"
    size="mini"
  >
    <el-form-item
      v-if="operation === 'create'"
      label="规则类型"
      prop="type"
    >
      <el-radio-group v-model="ruleConfigData.type">
        <el-radio label="mock">Mock响应数据</el-radio>
        <el-radio label="response">修改响应数据</el-radio>
        <el-radio label="request">修改请求数据</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      label="URL匹配规则"
      prop="matcher"
    >
      <el-select
        v-model="ruleConfigData.matcher"
        placeholder="请选择URL匹配规则"
      >
        <el-option
          v-for="matcher in matchers"
          :key="matcher"
          :label="matcher"
          :value="matcher"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item
      label="URL匹配内容"
      prop="pattern"
      placeholder="请选择URL匹配内容"
    >
      <el-input v-model="ruleConfigData.pattern"></el-input>
    </el-form-item>
    <el-form-item
      v-if="ruleConfigData.type === 'request'"
      label="请求头"
      prop="header"
    >
      <el-input
        type="textarea"
        :value="JSONtoStr(ruleConfigData.header)"
        @input="
          (val) => {
            ruleConfigData.header = val
          }
        "
        @blur="
          (e) => {
            ruleConfigData.header = this.strToJSON(e.target.value)
          }
        "
      ></el-input>
    </el-form-item>
    <el-form-item
      v-if="ruleConfigData.type === 'request'"
      label="请求内容"
      prop="body"
    >
      <el-input
        type="textarea"
        :value="JSONtoStr(ruleConfigData.body)"
        @input="
          (val) => {
            ruleConfigData.body = val
          }
        "
        @blur="
          (e) => {
            ruleConfigData.body = this.strToJSON(e.target.value)
          }
        "
      ></el-input>
    </el-form-item>
    <el-form-item
      v-if="ruleConfigData.type === 'mock' || ruleConfigData.type === 'response'"
      label="HTTP状态码"
      prop="response.statusCode"
    >
      <el-input v-model="ruleConfigData.response.statusCode"></el-input>
    </el-form-item>
    <el-form-item
      v-if="ruleConfigData.type === 'mock' || ruleConfigData.type === 'response'"
      label="响应头"
      prop="response.header"
    >
      <el-input
        type="textarea"
        rows="4"
        :value="JSONtoStr(ruleConfigData.response.header)"
        @input="
          (val) => {
            ruleConfigData.response.header = val
          }
        "
        @blur="
          (e) => {
            ruleConfigData.response.header = this.strToJSON(e.target.value)
          }
        "
      ></el-input>
    </el-form-item>
    <el-form-item
      v-if="ruleConfigData.type === 'mock' || ruleConfigData.type === 'response'"
      label="响应内容类型"
      prop="bodyType"
    >
      <el-radio-group v-model="ruleConfigData.bodyType">
        <el-radio label="string"></el-radio>
        <el-radio label="file"></el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      v-if="(ruleConfigData.type === 'mock' || ruleConfigData.type === 'response') && ruleConfigData.bodyType === 'string'"
      label="响应内容"
      prop="bodyContent"
    >
      <el-input
        type="textarea"
        v-model="ruleConfigData.bodyContent"
      ></el-input>
    </el-form-item>
    <el-form-item
      v-if="(ruleConfigData.type === 'mock' || ruleConfigData.type === 'response') && ruleConfigData.bodyType === 'file'"
      label="响应内容"
      prop="bodyPath"
    >
      {{ruleConfigData.bodyPath}}
      <el-button
        @click="selectResponseFile"
        size="mini"
        icon="el-icon-upload2"
        circle
      ></el-button>
    </el-form-item>
    <el-form-item
      label="标签"
      prop="tags"
    >
      <el-tag
        :key="tag"
        v-for="tag in ruleConfigData.tags"
        closable
        :disable-transitions="false"
        @close="handleRemoveTag(tag)"
      >
        {{tag}}
      </el-tag>
      <el-input
        class="input-new-tag"
        v-if="tagInputVisible"
        v-model="tagInputValue"
        ref="saveTagInput"
        size="small"
        @keyup.enter.native="handleTagConfirm"
        @blur="handleTagConfirm"
      >
      </el-input>
      <el-button
        v-else
        class="button-new-tag"
        size="small"
        @click="showTagInput"
      >+ New Tag</el-button>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="submitForm('ruleConfigForm')"
      >{{this.operation === 'create' ? '立即创建' : '修改'}}</el-button>
      <el-button @click="resetForm('ruleConfigForm')">重置</el-button>
      <el-button @click="() => {this.$emit('cancelRuleConfig')}">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  props: {
    operation: {
      type: String,
      default: 'create'
    },
    ruleConfig: {
      type: Object
    }
  },
  beforeCreate () {
    this.matchers = this.$proxyApi.getMatchers()
  },
  data () {
    const isValidJSON = (rule, value, callback) => {
      try {
        if (typeof value === 'string' && value.trim() === '') {
          callback()
        } else if (typeof value === 'object') {
          callback()
        } else {
          JSON.parse(value)
          callback()
        }
      } catch (e) {
        callback(new Error('请输入合法的JSON字符串'))
      }
    }
    const isValidHTTPCode = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('HTTP状态码不能为空'))
      }
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('请输入数字值'))
        } else {
          if (value < 100 || value > 600) {
            callback(new Error('请输入合法的HTTP状态码'))
          }
          callback()
        }
      }, 500)
    }

    return {
      ruleConfigData: JSON.parse(JSON.stringify(this.ruleConfig)),
      validators: {
        type: [
          { required: true, message: '请选择规则类型', trigger: 'change' }
        ],
        matcher: [
          { required: true, message: '请选择URL匹配规则', trigger: 'change' }
        ],
        pattern: [
          { required: true, message: '请输入URL匹配内容', trigger: 'blur' }
        ],
        header: [
          { validator: isValidJSON, trigger: 'blur' }
        ],
        body: [
          { validator: isValidJSON, trigger: 'blur' }
        ],
        'response.statusCode': [
          { validator: isValidHTTPCode, trigger: 'blur' }
        ],
        'response.header': [
          { validator: isValidJSON, trigger: 'blur' }
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
          this.$emit('submitRuleConfig', this.ruleConfigData)
        } else {
          return false
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    strToJSON (val) {
      let result
      try {
        result = JSON.parse(val)
      } catch (e) {
        result = val
      }
      return result
    },
    JSONtoStr (val) {
      if (typeof val === 'string') {
        return val
      }
      return JSON.stringify(val, null, 4)
    },
    selectResponseFile () {
      this.$dialog.showOpenDialog({
        properties: ['openFile']
      }, (filePaths) => {
        const responseFilePath = filePaths[0]
        if (responseFilePath) {
          this.ruleConfigData.bodyPath = responseFilePath
        }
      })
    },
    handleRemoveTag (tag) {
      const found = this.ruleConfigData.tags.indexOf(tag)
      if (found > -1) {
        this.ruleConfigData.tags.splice(found, 1)
      }
    },
    showTagInput () {
      this.tagInputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleTagConfirm () {
      if (this.tagInputValue) {
        if (this.ruleConfigData.tags.indexOf(this.tagInputValue) === -1) {
          this.ruleConfigData.tags.push(this.tagInputValue)
        } else {
          this.$message({
            message: '标签已存在',
            type: 'error'
          })
        }
      } else {
        this.$message({
          message: '请输入非空标签',
          type: 'error'
        })
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
  font-weight: bold;
}
.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  vertical-align: bottom;
}
</style>
