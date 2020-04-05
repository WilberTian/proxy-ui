<template>
  <div class="proxy-rule-data">
    <div class="request-info-wrapper" v-if="false">
      <div class="request-info-item">
        <div class="request-number">
          N/A
        </div>
        <div class="request-info">
          生效规则
        </div>
      </div>
      <div class="request-info-item">
        <div class="request-number">
          {{hitCount}}
        </div>
        <div class="request-info">
          命中数
        </div>
      </div>
    </div>
    <div class="data-wrapper" v-if="Object.keys(effectiveRules).length > 0">
      <el-collapse accordion>
        <el-collapse-item v-for="guid in Object.keys(effectiveRules)"
        :key="guid"> 
          <template slot="title">
            <div class="rule-config-matcher" v-if="effectiveRules[guid].ruleConfig.type !== 'customize'">
              {{effectiveRules[guid].ruleConfig.matcher}}
            </div>
            <div class="rule-config-pattern" v-if="effectiveRules[guid].ruleConfig.type !== 'customize'">
              {{effectiveRules[guid].ruleConfig.pattern}}
            </div>
            <div class="rule-config-name" v-if="effectiveRules[guid].ruleConfig.type === 'customize'">
              {{effectiveRules[guid].ruleConfig.name}}
            </div>
            <div class="hit-data">
              命中 {{effectiveRules[guid].count}} 次
            </div>
          </template>
          <rule-config-detail :ruleConfig="effectiveRules[guid].ruleConfig"></rule-config-detail>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div
      class="no-data-msg"
      v-if="Object.keys(effectiveRules).length === 0"
    >
      当前没有规则命中！
    </div>
  </div>
</template>

<script>
import RuleConfigDetail from './rule-config-detail'

export default {
  data () {
    return {
      hitCount: 0,
      effectiveRules: {}
    }
  },
  mounted () {
    this.hookDataListener = () => {
      const hookData = this.$proxyApi.getHookData()
      this.hitCount = hookData.hitCount
      this.effectiveRules = hookData.effectiveRules
      this.$store.commit('updateProxyServerData', {
        hittedRuleCount: Object.keys(this.effectiveRules).length
      })
    }
    this.$ipcRenderer.on('hook-data-updated', this.hookDataListener)
    this.hookDataListener()
  },
  beforeDestroy () {
    this.$ipcRenderer.removeListener('hook-data-updated', this.hookDataListener)
  },
  components: {
    RuleConfigDetail
  }
}
</script>

<style scoped>
.proxy-rule-data {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.request-info-wrapper {
  display: flex;
  justify-content: space-evenly;
  padding: 4px;
}
.request-info-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  box-shadow: 0px 0px 4px 0px #c0c4cc;
  margin-bottom: 12px;
  user-select: none;
}
.request-info-item .request-number {
  font-size: 22px;
  padding: 2px;
  font-weight: bold;
  color: #3a8ee6;
}
.request-info-item .request-info {
  font-size: 12px;
  font-weight: bold;
  color: #444;
}
.data-wrapper {
  flex: 1;
  overflow-y: auto;
}
.el-collapse-item__header {
  position: relative;
  display: flex;
}
.el-collapse-item__header .rule-config-matcher {
  width: 80px;
  padding-left: 4px;
}
.el-collapse-item__header .rule-config-pattern {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-emphasis: ellipse;
  color: #999;
}
.el-collapse-item__header .rule-config-name {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-emphasis: ellipse;
  color: #444;
  padding-left: 4px;
}
.el-collapse-item__header .hit-data {
  height: 28px;
  padding: 0 8px;
  line-height: 28px;
  border-radius: 50%;
  color: #444;
}
.proxy-rule-data .no-data-msg {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #999;
}
.rule-config-detail-wrapper {
  padding: 12px;
  background-color: #efefef;
  max-height: 180px;
  overflow-y: auto;
}
</style>
