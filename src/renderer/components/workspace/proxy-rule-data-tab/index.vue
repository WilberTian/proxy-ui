<template>
  <div class="proxy-rule-data">
    <div class="data-wrapper" v-if="Object.keys(effectiveRules).length > 0">
      <el-collapse accordion>
        <el-collapse-item
          v-for="guid in Object.keys(effectiveRules)"
          :key="guid"
        >
          <template slot="title">
            <div
              class="rule-config-matcher"
              v-if="effectiveRules[guid].ruleConfig.type !== 'customize'"
            >
              {{ effectiveRules[guid].ruleConfig.matcher }}
            </div>
            <div
              class="rule-config-pattern"
              v-if="effectiveRules[guid].ruleConfig.type !== 'customize'"
            >
              {{ effectiveRules[guid].ruleConfig.pattern }}
            </div>
            <div
              class="rule-config-name"
              v-if="effectiveRules[guid].ruleConfig.type === 'customize'"
            >
              {{ effectiveRules[guid].ruleConfig.name }}
            </div>
            <div class="hit-data">命中 {{ effectiveRules[guid].count }} 次</div>
          </template>
          <rule-config-detail
            :ruleConfig="effectiveRules[guid].ruleConfig"
          ></rule-config-detail>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="no-data-msg" v-if="Object.keys(effectiveRules).length === 0">
      当前没有规则命中！
    </div>
  </div>
</template>

<script>
import RuleConfigDetail from './rule-config-detail'
import showNotification from '@/utils/show-notification'

export default {
  data() {
    return {
      hitCount: 0,
      effectiveRules: {}
    }
  },
  mounted() {
    this.hookDataListener = () => {
      const hookData = this.$proxyApi.getHookData()
      this.hitCount = hookData.hitCount
      this.effectiveRules = hookData.effectiveRules
      const hittedRuleCount = Object.keys(this.effectiveRules).length
      this.$store.commit('updateProxyServerData', {
        hittedRuleCount
      })
      if (hittedRuleCount > 0) {
        showNotification(
          '命中规则',
          {
            body: `命中规则${hittedRuleCount}条`,
            tag: 'hitted-rule-updated'
          },
          4000,
          () => {
            this.$proxyApi.showWindow()
          }
        )
      }
    }
    this.$ipcRenderer.on('hook-data-updated', this.hookDataListener)
    this.hookDataListener()
  },
  beforeDestroy() {
    this.$ipcRenderer.removeListener('hook-data-updated', this.hookDataListener)
  },
  components: {
    RuleConfigDetail
  }
}
</script>

<style lang="less" scoped>
.proxy-rule-data {
  height: 100%;
  display: flex;
  flex-direction: column;
  .data-wrapper {
    flex: 1;
    overflow-y: auto;

    .el-collapse-item__header {
      position: relative;
      display: flex;
      .rule-config-matcher {
        width: 80px;
        padding-left: 4px;
      }
      .rule-config-pattern {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-emphasis: ellipse;
        color: #999;
      }
      .rule-config-name {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-emphasis: ellipse;
        color: #444;
        padding-left: 4px;
      }
      .hit-data {
        height: 28px;
        padding: 0 8px;
        line-height: 28px;
        border-radius: 50%;
        color: #444;
      }
    }
  }
  .no-data-msg {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    color: #999;
  }
}
</style>
