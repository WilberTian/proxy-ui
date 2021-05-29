<template>
  <div class="rule-config">
    <div class="rule-config-list-wrapper">
      <rule-config-filter
        :tags="tags"
        :filterData="filterData"
        @filterChange="handleFilterChange"
        @enableSelected="toggleSelectedRules(true)"
        @disableSelected="toggleSelectedRules(false)"
      />
      <grouped-rule-config-list
        :tags="tags"
        v-if="ruleConfigs.length > 0"
        :ruleConfigs="filteredRuleConfigs"
        @editRuleConfig="handleEditRuleConfig"
      />
      <div class="no-config-rule-msg" v-if="filteredRuleConfigs.length === 0">没有规则！</div>
    </div>
    <el-button class="add-rule-btn" type="primary" size="small" icon="el-icon-plus" @click="showProxyRuleSetting" circle></el-button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import RuleConfigFilter from './rule-config-filter'
import GroupedRuleConfigList from './grouped-rule-config-list'

export default {
  computed: {
    ...mapGetters({
      ruleConfigs: 'getRuleConfigs',
      ruleEditMode: 'getRuleEditMode'
    }),
    filteredRuleConfigs () {
      let result = []
      if (this.ruleConfigs.length > 0) {
        result = this.ruleConfigs.filter((ruleConfig) => {
          if (this.filterData) {
            if ('selectedType' in this.filterData && this.filterData.selectedType !== ruleConfig.type) {
              return false
            }
            if ('enableStatus' in this.filterData && !!this.filterData.enableStatus !== ruleConfig.enabled) {
              return false
            }
            if ('selectedTags' in this.filterData && this.filterData.selectedTags.length > 0) {
              const hasTags = this.filterData.selectedTags.filter((v) => {
                return ruleConfig.tags.indexOf(v) !== -1
              })
              if (hasTags.length === 0) {
                return false
              }
            }
            if ('keyword' in this.filterData) {
              const keyword = this.filterData.keyword

              const ruleSearch = `${ruleConfig.pattern} ${ruleConfig.name} ${ruleConfig.description}`
              if (!ruleSearch.includes(keyword)) {
                return false
              }
            }
          }
          return true
        })
      }
      return result
    },
    tags () {
      let tags = []
      if (this.ruleConfigs.length > 0) {
        let temp = []
        this.ruleConfigs.forEach((ruleConfig) => {
          Array.prototype.push.apply(temp, ruleConfig.tags)
        })
        tags = Array.from(new Set(temp))
      }
      return tags
    }
  },
  data () {
    return {
      selectedRuleConfig: null,
      operation: null,
      filterData: null
    }
  },
  mounted () {
    this.proxyRuleConfigUpdateHandler = () => {
      const ruleConfigs = this.$proxyApi.readRuleConfigs()
      this.$store.commit('setRuleConfigs', ruleConfigs)
    }
    this.$ipcRenderer.on('proxy-rule-config-updated', this.proxyRuleConfigUpdateHandler)
    this.proxyRuleConfigUpdateHandler()
  },
  beforeDestroy () {
    this.$ipcRenderer.removeListener('proxy-rule-config-updated', this.proxyRuleConfigUpdateHandler)
  },
  methods: {
    handleFilterChange (filterData) {
      this.filterData = filterData
    },
    handleEditRuleConfig (selectedRuleConfig) {
      this.selectedRuleConfig = selectedRuleConfig
      this.$ipcRenderer.send('show-proxy-rule-window', this.selectedRuleConfig)
    },
    toggleSelectedRules (isEnabled) {
      if (this.filteredRuleConfigs.length > 0) {
        const filteredRuleConfigs = [...this.filteredRuleConfigs]
        const ruleConfigs = filteredRuleConfigs.map((ruleConfig) => {
          return {
            ...ruleConfig,
            enabled: isEnabled
          }
        })
        this.$proxyApi.updateRuleConfigs(ruleConfigs)
      }
    },
    showProxyRuleSetting () {
      this.$ipcRenderer.send('show-proxy-rule-window')
    }
  },
  components: {
    GroupedRuleConfigList,
    RuleConfigFilter
  }
}
</script>

<style scoped>
.rule-config {
  height: 100%;
  overflow: auto;
}
.add-rule-btn {
  position: fixed;
  right: 20px;
  bottom: 34px;
}
.rule-config .rule-config-list-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.rule-config .rule-config-list-wrapper .rule-config-filter {
  padding: 8px;
  margin: 8px;
  box-shadow: 0px 0px 2px 2px #eee;
  user-select: none;
}
.rule-config .rule-config-list-wrapper .grouped-rule-config-list {
  margin: 8px;
}
.no-config-rule-msg {
  padding: 12px;
}
</style>
