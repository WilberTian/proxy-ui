<template>
  <div class="rule-config-list">
    <div
      :class="{'rule-config-item': true, 'disabled': !ruleConfig.enabled}"
      v-for="ruleConfig in ruleConfigs"
      :key="ruleConfig.guid"
    >
      <div class="rule-config-info-wrapper">
        <div class="rule-config-info" v-if="ruleConfig.type !== 'customize'">
          <div class="rule-config-matcher">{{ruleConfig.matcher}}</div>
          <tooltip-wrapper :content="ruleConfig.pattern" className="rule-config-pattern" />
        </div>
        <div class="rule-config-info" v-if="ruleConfig.type === 'customize'">
          <tooltip-wrapper :content="ruleConfig.name" className="rule-config-name" />
          <tooltip-wrapper :content="ruleConfig.description" className="rule-config-description" />
        </div>
        <!-- <div class="rule-config-tags">
          <div class="rule-config-tag" v-for="(tag, idx) in ruleConfig.tags" :key="idx">
            {{tag}}
          </div>
        </div> -->
      </div>
      <div class="rule-config-operation">
        <i
          title="编辑规则"
          class="el-icon-edit"
          @click="handleEditRuleConfig(ruleConfig)"
        ></i>
        <i
          title="复制规则"
          class="el-icon-document-copy"
          @click="handleCloneRuleConfig(ruleConfig)"
        ></i>
        <i
          title="删除规则"
          class="el-icon-document-delete"
          @click="handleDeleteRuleConfig(ruleConfig)"
        ></i>
        <preview-icon
          :title="`${ruleConfig.enabled ? '禁用规则' : '启用规则'}`"
          :value="ruleConfig.enabled"
          @input="(status) => { updateRuleConfigStatus(ruleConfig, status) }"
        />
      </div>
    </div>
  </div>
</template>

<script>
import PreviewIcon from './preview-icon'
import createGUID from '@/utils/uuidv4'
import TooltipWrapper from './tooltip-wrapper'

export default {
  props: {
    ruleConfigs: {
      type: Array
    }
  },
  data () {
    return {
      selectedRuleConfig: null
    }
  },
  methods: {
    handleEditRuleConfig (selectedRuleConfig) {
      this.selectedRuleConfig = selectedRuleConfig
      this.$emit('editRuleConfig', selectedRuleConfig)
    },
    handleDeleteRuleConfig (ruleConfig) {
      this.$confirm('确认删除规则?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$proxyApi.deleteRuleConfig(ruleConfig)
        })
        .catch(() => {
          //
        })
    },
    handleCloneRuleConfig (ruleConfig) {
      this.$confirm('复制规则?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const clonedRuleConfig = JSON.parse(JSON.stringify(ruleConfig))
          clonedRuleConfig.guid = createGUID()
          this.$proxyApi.addRuleConfig(clonedRuleConfig)
        })
        .catch(() => {
          //
        })
    },
    updateRuleConfigStatus (ruleConfig, status) {
      this.$proxyApi.updateRuleConfig({
        ...ruleConfig,
        enabled: status
      })
    }
  },
  components: {
    PreviewIcon,
    TooltipWrapper
  }
}
</script>

<style scoped>
.rule-config-list .rule-config-item {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  width: 200px;
  height: 100px;
  margin: 10px;
  border: 1px solid #d7d7d7;
  border-radius: 4px;
  overflow: hidden;
  background: aliceblue;
}
.rule-config-list .rule-config-item.disabled {
  background-color: #efefef;
  opacity: .8;
}
.rule-config-list .rule-config-item .rule-config-operation {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #d7d7d7;
  user-select: none;
}
.rule-config-list .rule-config-item .rule-config-operation i {
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
}
.rule-config-list .rule-config-item .rule-config-type {
  background-color: #333;
  opacity: .7;
  color: #fff;
  height: 24px;
  line-height: 24px;
  width: 80px;
  text-align: center;
  font-size: 12px;
  font-weight: bold;
}
.rule-config-list .rule-config-item  .rule-config-info-wrapper {
  flex: 1;
  overflow: hidden;
}
.rule-config-list .rule-config-item .rule-config-info {
  padding: 4px;
}
.rule-config-list .rule-config-item .rule-config-tags {
  padding: 0;
}
.rule-config-list .rule-config-item .rule-config-tags .rule-config-tag {
  display: inline-block;
  height: 18px;
  line-height: 18px;
  padding: 0 4px;
  margin: 4px;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  background-color: rgba(64,158,255,.6);
}
.rule-config-matcher, .rule-config-name {
  height: 24px;
  line-height: 24px;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.rule-config-pattern, .rule-config-description {
  height: 40px;
  line-height: 20px;
  font-size: 14px;
  color: #444;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-word;
}
</style>
