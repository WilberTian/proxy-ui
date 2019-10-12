<template>
  <div class="workspace-footer">
    <div
      class="step-item"
      v-if="currentStep === 1"
    >
      <div class="step-info">
        代理规则配置 （{{ruleConfigs.length}}条）
      </div>
      <el-radio-group v-model="displayMode" size="mini" :style="{marginRight: '10px'}">
        <el-radio-button label="group">
          标签分组
        </el-radio-button>
        <el-radio-button label="list">
          列表
        </el-radio-button>
      </el-radio-group>
      <el-popover
        placement="top"
        v-model="advanceSettingVisible"
        trigger="click"
      >
        <div class="advance-setting-item" @click="exportDialogVisible = true">导出规则配置</div>
        <div class="advance-setting-item" @click="importDialogVisible = true">导入规则配置</div>
        <div class="advance-setting-item" @click="resetRuleConfig">重置规则配置</div>
        <div
          class="advance-setting-btn"
          slot="reference"
        >
          高级
        </div>
      </el-popover>
      <div
        class="create-rule-config-btn"
        @click="createRuleConfig"
      >
        <i class="el-icon-circle-plus-outline"></i>
        添加规则
      </div>
      <div
        class="operation-btn"
        @click="gotoProxyConfig"
      >
        下一步
      </div>
    </div>
    <div
      class="step-item"
      v-if="currentStep === 2"
    >
      <div class="step-info">
        代理服务器配置
      </div>
      <div
        class="operation-btn"
        @click="gotoRuleConfig"
      >
        <i class="el-icon-back"></i>
        代理规则配置
      </div>
    </div>
    <el-dialog
      title="导入规则"
      :fullscreen="true"
      :visible.sync="importDialogVisible"
      custom-class="fullscreen-dialog import-dialog"
    >
      <el-input
        type="textarea"
        resize="none"
        placeholder="请输入内容"
        v-model="contentToImport">
      </el-input>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="processImport" size="small" :disabled="contentToImport.trim() === ''">确定</el-button>
        <el-button @click="importDialogVisible = false" size="small">取消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="导出规则"
      :fullscreen="true"
      :visible.sync="exportDialogVisible"
      custom-class="fullscreen-dialog"
    >
      <pre class="exported-content">{{exportedRuleConfigs}}</pre>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small">
          <span
            v-clipboard:copy="exportedRuleConfigs"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError"
          >
            复制内容
          </span>
        </el-button>
        <el-button @click="exportDialogVisible = false" size="small">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import VueClipboard from 'vue-clipboard2'
import { mapGetters } from 'vuex'
import events from '@/configs/events'
import eventBus from '@/utils/event-bus'
import createGUID from '@/utils/uuidv4'

const Ajv = require('ajv')

Vue.use(VueClipboard)

export default {
  data () {
    return {
      advanceSettingVisible: false,
      importDialogVisible: false,
      exportDialogVisible: false,
      contentToImport: ''
    }
  },
  computed: {
    ...mapGetters({
      currentStep: 'getCurrentStep',
      ruleConfigs: 'getRuleConfigs',
      ruleConfigListDisplayMode: 'getRuleConfigListDisplayMode'
    }),
    exportedRuleConfigs () {
      if (this.ruleConfigs.length > 0) {
        const convertedData = JSON.parse(JSON.stringify(this.ruleConfigs))
        convertedData.forEach((item) => {
          delete item.guid
          delete item.enabled
        })
        return JSON.stringify(convertedData, null, 2)
      }
      return ''
    },
    displayMode: {
      get () {
        return this.ruleConfigListDisplayMode
      },
      set (val) {
        this.$store.commit('setRuleConfigListDisplayMode', val)
      }
    }
  },
  beforeCreate () {
    this.ajv = new Ajv()
    this.ruleConfigSchema = this.$proxyApi.getRuleConfigSchema()
  },
  methods: {
    gotoProxyConfig () {
      this.$store.commit('setCurrentStep', 2)
    },
    gotoRuleConfig () {
      this.$store.commit('setCurrentStep', 1)
    },
    createRuleConfig () {
      eventBus.$emit(events.CREATE_RULE_CONFIG)
    },
    resetRuleConfig () {
      this.$confirm('确认重置规则配置，已有配置将会丢失?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const ruleConfigs = this.$proxyApi.getDefaultRuleConfigs()
          this.$store.commit('setRuleConfigs', ruleConfigs)
        })
        .catch(() => {
          //
        })
    },
    processImport () {
      try {
        const ruleConfigs = JSON.parse(this.contentToImport)
        const valid = this.ajv.validate(this.ruleConfigSchema, ruleConfigs)
        if (valid) {
          ruleConfigs.forEach((item) => {
            item.guid = createGUID()
            item.enabled = true
          })
          this.$store.commit('setRuleConfigs', ruleConfigs)
          this.importDialogVisible = false
          this.contentToImport = ''
        } else {
          this.$message.error('导入的数据格式错误')
        }
      } catch (e) {
        this.$message.error('导入的数据格式错误')
      }
    },
    onCopy: function (e) {
      this.$message.success('复制成功！')
    },
    onError: function (e) {
      this.$message.success('复制失败！')
    }
  }
}
</script>

<style scoped>
.workspace-footer {
  height: 40px;
  line-height: 40px;
  background-color: #d7d7d7;
}
.step-item {
  display: flex;
  align-items: center;
  padding: 0 12px;
}
.step-info {
  font-size: 14px;
  font-weight: bold;
  flex: 1;
}
.create-rule-config-btn,
.operation-btn,
.advance-setting-btn {
  height: 26px;
  line-height: 26px;
  padding: 2px 12px;
  margin: 0 8px;
  background: #409eff;
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}
.create-rule-config-btn i {
  font-weight: bold;
}
.operation-btn {
  margin-left: 32px;
}
.operation-btn i {
  font-weight: bold;
}
.advance-setting-btn {
  height: 22px;
  line-height: 22px;
  color: #333;
  border: 2px solid #999;
  background: transparent;
}
.advance-setting-item {
  height: 26px;
  line-height: 26px;
  padding: 4px 10px;
  margin: 8px;
  background: #409eff;
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  user-select: none;
}
.exported-content {
  box-sizing: border-box;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: auto;
  line-height: 1;
  border: 1px solid #999;
}
</style>
