<template>
  <div class="rule-config">
    <div class="rule-config-list-wrapper" v-if="!ruleSettingVisible">
      <rule-config-filter :tags="tags" @filterChange="handleFilterChange" />
      <div
        class="create-rule-btn"
        @click="handleCreateConfigRule"
        circle
      >+</div>
      <rule-config-list
        v-if="filteredRuleConfigs.length > 0"
        :ruleConfigs="filteredRuleConfigs"
        @editRuleConfig="handleEditRuleConfig"
      />
      <div class="no-config-rule-msg" v-else>没有规则！</div>
    </div>
    <rule-config-setting
      v-if="ruleSettingVisible"
      :operation="operation"
      :ruleConfig="selectedRuleConfig"
      @submitRuleConfig="handleSubmitRuleConfig"
      @cancelRuleConfig="handleCancelRuleConfig"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import RuleConfigFilter from './rule-config-filter'
import RuleConfigList from './rule-config-list'
import RuleConfigSetting from './rule-config-setting'
import creatGUID from '@/utils/uuidv4'
import { defaultRuleConfigs } from '@/configs/constants'

export default {
  computed: {
    ...mapGetters({
      ruleConfigs: 'getRuleConfigs'
    }),
    filteredRuleConfigs () {
      let result = []
      if (this.ruleConfigs.length > 0) {
        result = this.ruleConfigs.filter((ruleConfig) => {
          if (this.filterData) {
            if ('selectedType' in this.filterData && this.filterData.selectedType !== ruleConfig.type) {
              return false
            }
            if ('enableStatus' in this.filterData && this.filterData.enableStatus !== ruleConfig.enabled) {
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
  data () {
    return {
      ruleSettingVisible: false,
      selectedRuleConfig: null,
      operation: null,
      filterData: null
    }
  },
  mounted () {
    const ruleConfig = this.$proxyApi.readRuleConfig()
    this.$store.commit('setRuleConfigs', ruleConfig)
  },
  methods: {
    handleFilterChange (filterData) {
      this.filterData = filterData
    },
    handleSubmitRuleConfig (ruleConfig) {
      this.ruleSettingVisible = false
      this.selectedRuleConfig = null
      if ('guid' in ruleConfig) {
        this.$store.commit('updateRuleConfig', ruleConfig)
      } else {
        const ruleConfigToAdd = {
          ...ruleConfig,
          guid: creatGUID()
        }
        this.$store.commit('addRuleConfig', ruleConfigToAdd)
      }
      this.$store.commit('setWorkspaceFooterVisible', true)
    },
    handleCancelRuleConfig () {
      this.ruleSettingVisible = false
      this.$store.commit('setWorkspaceFooterVisible', true)
    },
    handleEditRuleConfig (selectedRuleConfig) {
      this.selectedRuleConfig = selectedRuleConfig
      this.operation = 'edit'
      this.ruleSettingVisible = true
      this.$store.commit('setWorkspaceFooterVisible', false)
    },
    handleCreateConfigRule () {
      this.$store.commit('setWorkspaceFooterVisible', false)
      this.selectedRuleConfig = defaultRuleConfigs.mock
      this.operation = 'create'
      this.ruleSettingVisible = true
    }
  },
  components: {
    RuleConfigList,
    RuleConfigSetting,
    RuleConfigFilter
  }
}
</script>

<style scoped>
.rule-config .rule-config-list-wrapper {
  position: relative;
}
.rule-config .rule-config-list-wrapper .create-rule-btn {
  position: absolute;
  top: 8px;
  right: 22px;
  z-index: 1;
  height: 32px;
  width: 32px;
  text-align: center;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  font-weight: bold;
  font-size: 24px;
  cursor: pointer;
}
.rule-config .rule-config-list-wrapper .rule-config-filter {
  margin: 12px;
  padding: 12px;
  border: 1px solid #d7d7d7;
}
.no-config-rule-msg {
  padding: 12px;
}
.rule-config-setting {
  padding: 20px;
}
</style>
