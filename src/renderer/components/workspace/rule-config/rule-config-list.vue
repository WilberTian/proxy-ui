<template>
  <div
    class="rule-config-list"
    v-masonry
    transition-duration="0.2s"
    item-selector=".rule-config-item"
  >
    <div
      v-masonry-tile
      :class="{'rule-config-item': true, 'disabled': !ruleConfig.enabled}"
      v-for="ruleConfig in ruleConfigs"
      :key="ruleConfig.guid"
    >
      <div class="rule-config-type" >{{ruleConfig.type | ruleTypeConvertor}}</div>
      <div class="rule-config-info-wrapper">
        <div class="rule-config-info" v-if="ruleConfig.type !== 'customize'">
          <div class="rule-config-matcher">{{ruleConfig.matcher}}</div>
          <tooltip-wrapper :content="ruleConfig.pattern" className="rule-config-pattern" />
        </div>
        <div class="rule-config-info" v-if="ruleConfig.type === 'customize'">
          <tooltip-wrapper :content="ruleConfig.name" className="rule-config-name" />
          <tooltip-wrapper :content="ruleConfig.description" className="rule-config-description" />
        </div>
        <div class="rule-config-tags">
          <div class="rule-config-tag" v-for="(tag, idx) in ruleConfig.tags" :key="idx">
            {{tag}}
          </div>
        </div>
      </div>
      <div class="rule-config-operation">
        <el-tooltip class="item" effect="dark" content="编辑规则" placement="top">
           <i
            class="el-icon-edit"
            @click="handleEditRuleConfig(ruleConfig)"
          ></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="复制规则" placement="top">
          <i
            class="el-icon-document-copy"
            @click="handleCloneRuleConfig(ruleConfig)"
          ></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="删除规则" placement="top">
          <i
            class="el-icon-document-delete"
            @click="handleDeleteRuleConfig(ruleConfig)"
          ></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" :content="`${ruleConfig.enabled ? '禁用规则' : '启用规则'}`" placement="top">
          <preview-icon
            :value="ruleConfig.enabled"
            @input="(status) => { updateRuleConfigStatus(ruleConfig, status) }"
          />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { VueMasonryPlugin } from 'vue-masonry/dist/vue-masonry-plugin-umd'
import PreviewIcon from './preview-icon'
import createGUID from '@/utils/uuidv4'
import TooltipWrapper from './tooltip-wrapper'

Vue.use(VueMasonryPlugin)

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
          this.$store.commit('deleteRuleConfig', ruleConfig.guid)
          if (ruleConfig.type === 'customize') {
            this.$proxyApi.deleteCustomizeRule(ruleConfig)
          }
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
          const result = this.$proxyApi.writeCustomizeRule(clonedRuleConfig.guid, clonedRuleConfig.customizeRule)
          if (result) {
            this.$store.commit('cloneRuleConfig', clonedRuleConfig)
          } else {
            this.$message.error('复制自定义规则失败，请重试')
          }
        })
        .catch(() => {
          //
        })
    },
    updateRuleConfigStatus (ruleConfig, status) {
      this.$store.commit('updateRuleConfig', {
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
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 124px;
  margin: 12px;
  box-shadow: 1px 1px 8px 1px #b9b9b9;
  padding-top: 24px;
  border-radius: 4px;
  overflow: hidden;
}
.rule-config-list .rule-config-item.disabled {
  background-color: #efefef;
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
}
.rule-config-list .rule-config-item .rule-config-type {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #409eff;
  color: #fff;
  height: 22px;
  line-height: 22px;
  width: 80px;
  text-align: center;
  border-bottom-left-radius: 4px;
  border-top-right-radius: 4px;
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
  font-size: 16px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  border-bottom: 1px solid #eee;
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
}
</style>
