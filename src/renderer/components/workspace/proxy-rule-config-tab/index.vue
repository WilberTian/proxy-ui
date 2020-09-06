<template>
  <div class="rule-config">
    <div class="rule-config-list-wrapper">
      <rule-config-filter
        v-if="ruleConfigListDisplayMode === 'list'"
        :tags="tags"
        :filterData="filterData"
        @filterChange="handleFilterChange"
        @enableSelected="toggleSelectedRules(true)"
        @disableSelected="toggleSelectedRules(false)"
      />
      <listed-rule-config
        v-if="filteredRuleConfigs.length > 0 && ruleConfigListDisplayMode === 'list'"
        :ruleConfigs="filteredRuleConfigs"
        @editRuleConfig="handleEditRuleConfig"
      />
      <grouped-rule-config-list
        :tags="tags"
        v-if="ruleConfigs.length > 0 && ruleConfigListDisplayMode === 'group'"
        :ruleConfigs="ruleConfigs"
        @editRuleConfig="handleEditRuleConfig"
      />
      <div class="no-config-rule-msg" v-if="filteredRuleConfigs.length === 0">没有规则！</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import RuleConfigFilter from './rule-config-filter'
import ListedRuleConfig from './listed-rule-config'
import GroupedRuleConfigList from './grouped-rule-config-list'
import createGUID from '@/utils/uuidv4'
import events from '@/configs/events'
import eventBus from '@/utils/event-bus'

export default {
  computed: {
    ...mapGetters({
      ruleConfigs: 'getRuleConfigs',
      ruleConfigListDisplayMode: 'getRuleConfigListDisplayMode',
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
  // watch: {
  //   ruleConfigs: {
  //     deep: true,
  //     handler (val) {
  //       this.$proxyApi.writeRuleConfigs(val)
  //     }
  //   }
  // },
  data () {
    return {
      selectedRuleConfig: null,
      operation: null,
      filterData: null
    }
  },
  mounted () {
    eventBus.$on(events.CREATE_RULE_CONFIG, this.handleCreateConfigRule)

    this.proxyRuleConfigUpdateHandler = () => {
      const ruleConfigs = this.$proxyApi.readRuleConfigs()
      this.$store.commit('setRuleConfigs', ruleConfigs)
    }
    this.$ipcRenderer.on('proxy-rule-config-updated', this.proxyRuleConfigUpdateHandler)
    this.proxyRuleConfigUpdateHandler()
  },
  beforeDestroy () {
    eventBus.$off(events.CREATE_RULE_CONFIG, this.handleCreateConfigRule)
    this.$ipcRenderer.removeListener('proxy-rule-config-updated', this.proxyRuleConfigUpdateHandler)
  },
  methods: {
    handleFilterChange (filterData) {
      this.filterData = filterData
    },
    handleSubmitRuleConfig (ruleConfig) {
      let _ruleConfig = ruleConfig
      this.$store.commit('setRuleEditMode', false)
      this.selectedRuleConfig = null
      if ('guid' in ruleConfig) {
        this.$store.commit('updateRuleConfig', ruleConfig)
      } else {
        _ruleConfig = {
          ...ruleConfig,
          guid: createGUID()
        }
        this.$store.commit('addRuleConfig', _ruleConfig)
      }

      if (_ruleConfig.type === 'customize') {
        const result = this.$proxyApi.writeCustomizeRule(_ruleConfig)
        if (result) {
        } else {
          this.$message.error('创建/修改自定义规则失败，请重试')
        }
      } else {
      }
    },
    handleCancelRuleConfig () {
      // this.$store.commit('setRuleEditMode', false)
    },
    handleEditRuleConfig (selectedRuleConfig) {
      this.selectedRuleConfig = selectedRuleConfig
      this.$ipcRenderer.send('show-proxy-rule-window', {
        operation: 'edit',
        ruleConfig: this.selectedRuleConfig
      })
      // this.$store.commit('setRuleEditMode', true)
    },
    handleCreateConfigRule () {
      this.selectedRuleConfig = null
      this.operation = 'create'
      this.$ipcRenderer.send('show-proxy-rule-window')
      // this.$store.commit('setRuleEditMode', true)
    },
    toggleSelectedRules (isEnabled) {
      if (this.filteredRuleConfigs.length > 0) {
        const filteredRuleConfigs = [...this.filteredRuleConfigs]
        filteredRuleConfigs.forEach((ruleConfig) => {
          this.$store.commit('updateRuleConfig', {
            ...ruleConfig,
            enabled: isEnabled
          })
        })
      }
    }
  },
  components: {
    ListedRuleConfig,
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
.rule-config .rule-config-list-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.rule-config .rule-config-list-wrapper .rule-config-filter {
  padding: 10px;
  margin: 10px;
  box-shadow: 0px 0px 2px 2px #ddd;
  user-select: none;
}
.rule-config .rule-config-list-wrapper .rule-config-list {
  flex: 1;
  overflow-y: auto;
}
.no-config-rule-msg {
  padding: 12px;
}
</style>
