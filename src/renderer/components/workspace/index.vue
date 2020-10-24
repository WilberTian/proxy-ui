<template>
  <div class="workspace" v-loading.fullscreen="loading">
    <el-tabs class="workspace-tab-container" v-model="activeTab" type="border-card">
      <el-tab-pane label="网络数据" name="proxy-server-record" v-if="proxyServerStatus">
        <proxy-server-record />
      </el-tab-pane>
      <el-tab-pane label="代理配置信息" name="proxy-config-info">
        <div class="proxy-config-info-wrapper">
          <div class="proxy-config-info">
            <div class="proxy-config-item">
              <div class="label">
                代理服务器端口
              </div>
              <div class="content">
                {{proxyConfig.port}}
              </div>
            </div>
            <div class="proxy-config-item">
              <div class="label">
                开启HTTPS
              </div>
              <div class="content">
                {{proxyConfig.forceProxyHttps ? '开启' : '未开启'}}
              </div>
            </div>
            <div class="proxy-config-item">
              <div class="label">
                网络速度
              </div>
              <div class="content">
                {{networkSpeedValue}}
              </div>
            </div>
            <div class="proxy-config-item">
              <div class="label">
                开启全局代理
              </div>
              <div class="content">
                {{proxyConfig.enableGlobalProxy ? '开启' : '未开启'}}
              </div>
            </div>
            <div class="proxy-config-item">
              <div class="label">
                黑名单
              </div>
              <div class="content">
                {{(proxyConfig.bypassList && proxyConfig.bypassList.length > 0) ? proxyConfig.bypassList.join(', ') : '未设置'}}
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="代理规则配置" name="proxy-rule-config">
        <proxy-rule-config />
      </el-tab-pane>
      <el-tab-pane name="proxy-rule-data" v-if="proxyServerStatus">
        <span slot="label" style="display: flex; align-items: center;">
          命中规则
          <span class="hitted-rule-count" v-if="proxyServerData.hittedRuleCount > 0">
            {{proxyServerData.hittedRuleCount}}
          </span>
        </span>
        <proxy-rule-data />
      </el-tab-pane>
      <el-tab-pane name="proxy-server-log" v-if="proxyServerStatus">
        <span slot="label" style="display: flex; align-items: center;">
          代理服务器日志
          <span class="proxy-server-log-number" v-if="proxyServerData.proxyServerLogCount > 0">
            {{proxyServerData.proxyServerLogCount}}
          </span>
        </span>
        <proxy-server-log />
      </el-tab-pane>
      <el-tab-pane label="Weinre日志" name="weinre-data" v-if="weinreServerStatus">
        <weinre-data-tab />
      </el-tab-pane>
      <el-tab-pane name="request-list">
        <span slot="label" style="display: flex; align-items: center;">
          已录制请求
          <span class="request-list-count" v-if="proxyServerData.recordedRequestCount > 0">
            {{proxyServerData.recordedRequestCount}}
          </span>
        </span>
        <request-list-tab :proxyServerStatus="proxyServerStatus" />
      </el-tab-pane>
    </el-tabs>
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
import ProxyRuleConfig from './proxy-rule-config-tab/index'
import ProxyRuleData from './proxy-rule-data-tab/index'
import ProxyServerLog from './proxy-server-log-tab/index'
import ProxyServerRecord from './proxy-record-tab/index'
import WeinreDataTab from './weinre-data-tab/index'
import RequestListTab from './request-list-tab/index'
import { networkSpeed } from '@/configs/constants'
import createGUID from '@/utils/uuidv4'

const Ajv = require('ajv')

Vue.use(VueClipboard)

export default {
  data () {
    return {
      loading: false,
      activeTab: 'proxy-config-info',
      importDialogVisible: false,
      exportDialogVisible: false,
      contentToImport: '',

      weinreServerStatus: false
    }
  },
  computed: {
    ...mapGetters({
      proxyConfig: 'getProxyConfig',
      proxyServerData: 'getProxyServerData',
      ruleConfigs: 'getRuleConfigs',
      proxyServerStatus: 'getProxyServerStatus'
    }),
    networkSpeedValue () {
      let val = ''
      if (this.proxyConfig && this.proxyConfig.throttle) {
        const found = networkSpeed.find((item) => {
          return item.value === this.proxyConfig.throttle
        })
        if (found) {
          val = found.label
        }
      }
      return val
    },
    exportedRuleConfigs () {
      if (this.ruleConfigs.length > 0) {
        const convertedData = JSON.parse(JSON.stringify(this.ruleConfigs))
        convertedData.forEach((item) => {
          delete item.guid
        })
        return JSON.stringify(convertedData, null, 2)
      }
      return ''
    }
  },
  watch: {
    weinreServerStatus (val) {
      if (val === 1) {
        this.activeTab = 'weinre-data'
      } else {
        this.activeTab = 'proxy-config-info'
      }
    },
    proxyServerStatus (val) {
      if (val) {
        this.activeTab = 'proxy-server-record'
      } else {
        this.activeTab = 'proxy-config-info'
      }
    }
  },
  beforeCreate () {
    this.ajv = new Ajv()
    this.ruleConfigSchema = this.$proxyApi.getRuleConfigSchema()
  },
  mounted () {
    this.proxySettingSubmitHandler = () => {
      const proxyConfig = this.$proxyApi.readProxyConfig()
      this.$store.commit('setProxyConfig', proxyConfig)
    }
    this.$ipcRenderer.on('proxy-config-updated', this.proxySettingSubmitHandler)

    this.proxySettingSubmitHandler()

    this.$ipcRenderer.on('export-rule-config', this.showExportDialog)
    this.$ipcRenderer.on('import-rule-config', this.showImportDialog)

    this.proxyServerStatusUpdateHanlder = () => {
      const proxyServerStatus = this.$proxyApi.getPoxyServerStatus()
      this.$store.commit('setProxyServerStatus', proxyServerStatus)
    }
    this.$ipcRenderer.on('proxy-server-status-updated', this.proxyServerStatusUpdateHanlder)
    this.proxyServerStatusUpdateHanlder()

    this.proxyRuleConfigUpdateHandler = () => {
      if (this.proxyServerStatus) {
        this.$confirm('确认重启代理服务器应用代理规则变更?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.$proxyApi.restartProxyServer(this.proxyConfig)
          })
          .catch(() => {
            //
          })
      }
    }
    this.$ipcRenderer.on('proxy-rule-config-updated', this.proxyRuleConfigUpdateHandler)

    this.weinreStatusUpdateHandler = () => {
      this.weinreServerStatus = this.$proxyApi.getWeinreStatus()
    }
    this.$ipcRenderer.on('weinre-status-updated', this.weinreStatusUpdateHandler)
    this.weinreStatusUpdateHandler()
  },
  beforeDestroy () {
    this.$ipcRenderer.removeListener('proxy-config-updated', this.proxySettingSubmitHandler)
    this.$ipcRenderer.removeListener('export-rule-config', this.showExportDialog)
    this.$ipcRenderer.removeListener('import-rule-config', this.showImportDialog)
    this.$ipcRenderer.removeListener('proxy-server-status-updated', this.proxyServerStatusUpdateHanlder)
    this.$ipcRenderer.removeListener('proxy-rule-config-updated', this.proxyRuleConfigUpdateHandler)
    this.$ipcRenderer.removeListener('weinre-status-updated', this.weinreStatusUpdateHandler)
  },
  methods: {
    processImport () {
      try {
        const ruleConfigs = JSON.parse(this.contentToImport)
        const valid = this.ajv.validate(this.ruleConfigSchema, ruleConfigs)
        if (valid) {
          ruleConfigs.forEach((item) => {
            item.guid = createGUID()
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
    },
    showImportDialog () {
      this.importDialogVisible = true
    },
    showExportDialog () {
      this.exportDialogVisible = true
    }
  },
  components: {
    ProxyRuleConfig,
    ProxyRuleData,
    ProxyServerLog,
    ProxyServerRecord,
    WeinreDataTab,
    RequestListTab
  }
}
</script>

<style scoped>
.workspace {
  flex: 1;
  overflow: auto;
  display: flex;
}
.workspace .workspace-tab-container {
  flex: 1;
  overflow: hidden;
  border: none;
}

.workspace .proxy-config-info-wrapper {
  width: 100%;
  height: 100%;
}
.workspace .proxy-config-info-wrapper .proxy-config-info {
  margin: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}
.workspace .proxy-config-info-wrapper .proxy-config-info .proxy-config-item {
  display: flex; 
  font-size: 14px;
  border-bottom: 1px solid #e8e8e8;
}
.workspace .proxy-config-info-wrapper .proxy-config-info .proxy-config-item:last-child {
  border-bottom: none;
}
.workspace .proxy-config-info-wrapper .proxy-config-info .proxy-config-item .label {
  width: 160px;
  padding: 8px; 
  font-weight: bold;
  border-right: 1px solid #e8e8e8;
}
.workspace .proxy-config-info-wrapper .proxy-config-info .proxy-config-item .content {
  flex: 1;
  padding: 8px; 
}
.proxy-server-log-number, .hitted-rule-count, .request-list-count {
  background-color: #66b1ff;
  border-radius: 10px;
  color: #fff;
  display: inline-block;
  font-size: 12px;
  height: 16px;
  line-height: 16px;
  padding: 0 6px;
  text-align: center;
  white-space: nowrap;
  border: 1px solid #fff;
  margin-left: 6px;
}
</style>
