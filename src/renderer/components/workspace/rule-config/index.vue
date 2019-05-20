<template>
  <div class="rule-config">
    <el-button
      class="create-rule-btn"
      icon="el-icon-plus"
      size="mini"
      @click="createConfigRule"
    >创建规则</el-button>
    <div
      class="rule-config-list"
      v-if="ruleConfigs.length > 0"
    >
      <div
        class="rule-config-item"
        v-for="ruleConfig in ruleConfigs"
        :key="ruleConfig.guid"
      >
        <div class="rule-config-operation">
          <i
            class="el-icon-setting"
            @click="showRuleSettingDialog(ruleConfig)"
          ></i>
          <i
            class="el-icon-document-copy"
            @click="handleCloneRuleConfig(ruleConfig)"
          ></i>
          <i
            class="el-icon-document-delete"
            @click="handleDeleteRuleConfig(ruleConfig)"
          ></i>
          <preview-icon
            :value="ruleConfig.enabled"
            @input="(status) => { updateRuleConfigStatus(ruleConfig, status) }"
          />
        </div>
        <div class="rule-config-type">{{ruleConfig.type}}</div>
        <div class="rule-config-filter">
          <div class="rule-config-matcher">{{ruleConfig.matcher}}</div>
          <div class="rule-config-pattern">{{ruleConfig.pattern}}</div>
        </div>
      </div>
    </div>
    <div v-else>没有规则！</div>
    <el-dialog
      title="规则设置"
      :visible.sync="ruleSettingDialogVisible"
      width="60%"
    >
      <rule-config-setting
        :operation="operation"
        :ruleConfig="selectedRuleConfig"
        @submitRuleConfig="handleSubmitRuleConfig"
        @cancelRuleConfig="ruleSettingDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PreviewIcon from './preview-icon'
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
      ruleSettingDialogVisible: false,
      selectedRuleConfig: null,
      operation: null
    }
  },
  mounted () {
    const ruleConfig = this.$proxyApi.readRuleConfig()
    this.$store.commit('setRuleConfigs', ruleConfig)
  },
  methods: {
    showRuleSettingDialog (selectedRuleConfig) {
      this.selectedRuleConfig = selectedRuleConfig
      this.ruleSettingDialogVisible = true
      this.operation = 'edit'
    },
    handleSubmitRuleConfig (ruleConfig) {
      this.ruleSettingDialogVisible = false
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
    handleDeleteRuleConfig (ruleConfig) {
      this.$confirm('确认删除规则?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$store.commit('deleteRuleConfig', ruleConfig.guid)
        })
        .catch(() => {
          //
        })
    },
    handleCloneRuleConfig (ruleConifg) {
      //
    },
    updateRuleConfigStatus (ruleConfig, status) {
      this.$store.commit('updateRuleConfig', {
        ...ruleConfig,
        enabled: status
      })
    },
    createConfigRule () {
      this.selectedRuleConfig = defaultRuleConfigs.mock
      this.operation = 'create'
      this.ruleSettingDialogVisible = true
    }
  },
  components: {
    PreviewIcon,
    RuleConfigSetting
  }
}
</script>

<style scoped>
.rule-config-list .rule-config-item {
  position: relative;
  border-bottom: 1px solid #333;
  padding-top: 32px;
}

.rule-config-list .rule-config-item .rule-config-operation {
  position: absolute;
  top: 0;
  right: 110px;
}
.rule-config-list .rule-config-item .rule-config-operation i {
  cursor: pointer;
  padding: 4px;
}
.rule-config-list .rule-config-item .rule-config-type {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #409eff;
  color: #fff;
  height: 24px;
  line-height: 24px;
  width: 80px;
  text-align: center;
  border-bottom-left-radius: 4px;
}
.rule-config-list .rule-config-item .rule-config-filter {
  display: flex;
}
.rule-config-list .rule-config-item .rule-config-filter .rule-config-matcher {
  width: 90px;
  text-align: center;
}
.rule-config-list .rule-config-item .rule-config-filter .rule-config-pattern {
  flex: 1;
}
</style>
