<template>
  <div class="rule-config">
    <div class="rule-config-list-wrapper" v-if="!ruleSettingVisible">
      <div
        class="create-rule-btn"
        @click="handleCreateConfigRule"
        circle
      >+</div>
      <rule-config-list
        v-if="ruleConfigs.length > 0"
        :ruleConfigs="ruleConfigs"
        @editRuleConfig="handleEditRuleConfig"
      />
      <div v-else>没有规则！</div>
    </div>
    <rule-config-setting
      v-if="ruleSettingVisible"
      :operation="operation"
      :ruleConfig="selectedRuleConfig"
      @submitRuleConfig="handleSubmitRuleConfig"
      @cancelRuleConfig="ruleSettingVisible = false"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import RuleConfigList from './rule-config-list'
import RuleConfigSetting from './rule-config-setting'
import creatGUID from '@/utils/uuidv4'
import { defaultRuleConfigs } from '@/configs/constants'

export default {
  computed: {
    ...mapGetters({
      ruleConfigs: 'getRuleConfigs'
    })
  },
  data () {
    return {
      ruleSettingVisible: false,
      selectedRuleConfig: null,
      operation: null
    }
  },
  mounted () {
    const ruleConfig = this.$proxyApi.readRuleConfig()
    this.$store.commit('setRuleConfigs', ruleConfig)
  },
  methods: {
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
    },
    handleEditRuleConfig (selectedRuleConfig) {
      this.selectedRuleConfig = selectedRuleConfig
      this.operation = 'edit'
      this.ruleSettingVisible = true
    },
    handleCreateConfigRule () {
      this.selectedRuleConfig = defaultRuleConfigs.mock
      this.operation = 'create'
      this.ruleSettingVisible = true
    }
  },
  components: {
    RuleConfigList,
    RuleConfigSetting
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
  right: 8px;
  z-index: 1;
  height: 32px;
  width: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  font-weight: bold;
  font-size: 24px;
  cursor: pointer;
}
.rule-config-list {
  padding-top: 40px;
}
.rule-config-setting {
  padding: 20px;
}
</style>
