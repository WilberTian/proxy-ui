<template>
  <div>
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
        <el-radio-group v-model="ruleConfigType" @change="selectRuleConfigType">
          <el-radio label="mock">
            {{'mock' | ruleTypeConvertor}}
            <el-tooltip class="item" effect="dark" content="请求不会发送到服务器，代理服务器直接返回Mock响应" placement="bottom">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </el-radio>
          <el-radio label="response">
            {{'response' | ruleTypeConvertor}}
            <el-tooltip class="item" effect="dark" content="请求发送到服务器，代理服务器收到响应数据后进行处理，然后返回" placement="bottom">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </el-radio>
          <el-radio label="request">
            {{'request' | ruleTypeConvertor}}
            <el-tooltip class="item" effect="dark" content="修改请求数据，并发送的服务器" placement="bottom">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </el-radio>
          <el-radio label="customize">{{'customize' | ruleTypeConvertor}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="ruleConfigData.type !== 'customize'"
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
        v-if="ruleConfigData.type !== 'customize'"
        label="URL匹配内容"
        prop="pattern"
        placeholder="请选择URL匹配内容"
      >
        <el-input v-model="ruleConfigData.pattern"></el-input>
      </el-form-item>
      <el-form-item
        v-if="ruleConfigData.type === 'request' && ruleConfigData.type !== 'customize'"
        label="请求头"
        prop="header"
      >
        <http-header-editor :httpHeader="ruleConfigData.header" @change="(val) => {
          ruleConfigData.header = val
        }"/>
      </el-form-item>
      <el-form-item
        v-if="ruleConfigData.type === 'request' && ruleConfigData.type !== 'customize'"
        label="请求内容"
        prop="body"
      >
        <el-input
          type="textarea"
          v-model="ruleConfigData.body"
        ></el-input>
      </el-form-item>
      <el-form-item
        v-if="(ruleConfigData.type === 'mock' || ruleConfigData.type === 'response') && ruleConfigData.type !== 'customize'"
        label="HTTP状态码"
        prop="response.statusCode"
      >
        <el-input v-model="ruleConfigData.response.statusCode"></el-input>
      </el-form-item>
      <el-form-item
        v-if="(ruleConfigData.type === 'mock' || ruleConfigData.type === 'response') && ruleConfigData.type !== 'customize'"
        label="响应头"
        prop="response.header"
      >
        <http-header-editor :httpHeader="ruleConfigData.response.header" @change="(val) => {
          ruleConfigData.response.header = val
        }"/>
      </el-form-item>
      <el-form-item
        v-if="(ruleConfigData.type === 'mock' || ruleConfigData.type === 'response') && ruleConfigData.type !== 'customize'"
        label="响应内容类型"
        prop="bodyType"
      >
        <el-radio-group v-model="ruleConfigData.bodyType">
          <el-radio label="string">文本</el-radio>
          <el-radio label="file">文件</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="(ruleConfigData.type === 'mock' || ruleConfigData.type === 'response') && ruleConfigData.bodyType === 'string' && ruleConfigData.type !== 'customize'"
        label="响应内容"
        prop="bodyContent"
      >
        <el-input
          type="textarea"
          v-model="ruleConfigData.bodyContent"
        ></el-input>
      </el-form-item>
      <el-form-item
        v-if="(ruleConfigData.type === 'mock' || ruleConfigData.type === 'response') && ruleConfigData.bodyType === 'file' && ruleConfigData.type !== 'customize'"
        label="响应内容"
        prop="bodyPath"
      >
        <div style="display: flex;">
          <el-input v-model="ruleConfigData.bodyPath" placeholder="输入文件路径，或者点击按钮选择文件"></el-input>
          <el-tooltip class="item" effect="dark" content="选择本地文件" placement="left">
            <el-button
              type="primary"
              class="choose-file-btn"
              @click="selectResponseFile"
              size="mini"
              icon="el-icon-upload2"
              circle
            ></el-button>
          </el-tooltip>
        </div>
      </el-form-item>
      <el-form-item
        v-if="ruleConfigData.type === 'customize'"
        label="名称"
        prop="name"
        placeholder="自定义规则名称"
      >
        <el-input v-model="ruleConfigData.name"></el-input>
      </el-form-item>
      <el-form-item
        v-if="ruleConfigData.type === 'customize'"
        label="描述"
        prop="description"
        placeholder="自定义规则描述"
      >
        <el-input type="textarea" v-model="ruleConfigData.description"></el-input>
      </el-form-item>
      <el-form-item
        v-if="ruleConfigData.type === 'customize'"
        label="自定义规则"
        prop="customizeRule"
        placeholder="自定义规则"
      >
        <textarea class="customize-rule-editor" ref="customize-rule-editor"></textarea>
        <el-button class="show-sample-rule-btn" size="mini" type="primary" @click="showSampleRule" round>
          <i class="el-icon-collection"></i> 查看样例规则
        </el-button>
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
        >+ 标签</el-button>
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
    <el-dialog
      title="样例规则"
      :visible.sync="sampleRuleDialogVisible"
      :fullscreen="true"
      custom-class="fullscreen-dialog"
    >
      <div v-if="!sampleRules">没有规则样例！</div>
      <div v-if="sampleRules">
        <el-tabs v-model="activeSampleRuleIdx">
          <el-tab-pane v-for="(rule, idx) in sampleRules" :label="rule.sampleName" :key="idx" :name="idx.toString()">
            <pre class="sample-rule-preview" v-highlightjs><code class="javascript">{{rule.sampleContent}}</code></pre>
          </el-tab-pane>
        </el-tabs>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="useCurrentSampleRule">使用当前样例</el-button>
        <el-button size="small" @click="sampleRuleDialogVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { defaultRuleConfigs } from '@/configs/constants'
import HttpHeaderEditor from './http-header-editor'
import CodeMirror from 'codemirror/lib/codemirror.js'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'

import 'codemirror/addon/selection/active-line.js'

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
  mounted () {
    if (this.ruleConfigType === 'customize') {
      this.customizeRuleEditor = CodeMirror.fromTextArea(this.$refs['customize-rule-editor'], {
        tabSize: 2,
        mode: 'text/javascript',
        theme: 'monokai',
        lineNumbers: true,
        line: true,
        styleActiveLine: true
      })
      this.customizeRuleEditor.on('change', (cm) => {
        this.ruleConfigData.customizeRule = cm.getValue()
      })
      this.customizeRuleEditor.setValue(this.ruleConfigData.customizeRule)
    }
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

    let ruleConfigData
    let ruleConfigType = 'mock'
    if (this.ruleConfig) {
      ruleConfigData = JSON.parse(JSON.stringify(this.ruleConfig))
      ruleConfigType = ruleConfigData.type
    } else {
      ruleConfigData = defaultRuleConfigs[ruleConfigType]
    }
    return {
      ruleConfigType,
      ruleConfigData,
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
        name: [
          { required: true, message: '请输入自定义规则名称', trigger: 'blur' }
        ],
        customizeRule: [
          { required: true, message: '请输入自定义规则', trigger: 'blur' }
        ],
        header: [
          { validator: isValidJSON, trigger: 'blur' }
        ],
        'response.statusCode': [
          { required: true, validator: isValidHTTPCode, trigger: 'blur' }
        ],
        'response.header': [
          { validator: isValidJSON, trigger: 'blur' }
        ]
      },
      tagInputVisible: false,
      tagInputValue: '',
      sampleRuleDialogVisible: false,
      sampleRules: null,
      activeSampleRuleIdx: 0
    }
  },
  methods: {
    selectRuleConfigType (value) {
      this.ruleConfigData = defaultRuleConfigs[value]
      this.$nextTick(() => {
        if (value === 'customize' && !this.customizeRuleEditor) {
          this.customizeRuleEditor = CodeMirror.fromTextArea(this.$refs['customize-rule-editor'], {
            tabSize: 2,
            mode: 'text/javascript',
            theme: 'monokai',
            lineNumbers: true,
            line: true,
            styleActiveLine: true
          })
          this.customizeRuleEditor.on('change', (cm) => {
            this.ruleConfigData.customizeRule = cm.getValue()
          })
          this.customizeRuleEditor.setValue(this.ruleConfigData.customizeRule)
        } else {
          const cmEditorEl = this.$el.querySelector('.CodeMirror')
          if (cmEditorEl) {
            cmEditorEl.remove()
            this.customizeRuleEditor = null
          }
        }
      })
    },
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
      }
      this.tagInputVisible = false
      this.tagInputValue = ''
    },
    showSampleRule () {
      this.sampleRuleDialogVisible = true
      this.sampleRules = this.$proxyApi.getSampleRules()
    },
    useCurrentSampleRule () {
      this.sampleRuleDialogVisible = false
      const currentSampleRule = this.sampleRules[this.activeSampleRuleIdx]
      this.customizeRuleEditor.setValue(currentSampleRule.sampleContent)
    }
  },
  components: {
    HttpHeaderEditor
  }
}
</script>

<style scoped>
.rule-config-setting {
  padding: 16px 8px;
}
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
.show-sample-rule-btn {
  margin: 8px 0;
}
.sample-rule-preview {
  line-height: 20px;
}
.choose-file-btn {
  margin-left: 12px;
}
</style>
