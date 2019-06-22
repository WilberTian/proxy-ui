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
      <div class="rule-config-type">{{ruleConfig.type}}</div>
      <div class="rule-config-info" v-if="ruleConfig.type !== 'customize'">
        <div class="rule-config-matcher">{{ruleConfig.matcher}}</div>
        <div class="rule-config-pattern">{{ruleConfig.pattern}}</div>
      </div>
      <div class="rule-config-info" v-if="ruleConfig.type === 'customize'">
        <div class="rule-config-name">{{ruleConfig.name}}</div>
        <div class="rule-config-description">{{ruleConfig.description}}</div>
      </div>
      <div class="rule-config-tags">
        <div class="rule-config-tag" v-for="(tag, idx) in ruleConfig.tags" :key="idx">
          {{tag}}
        </div>
      </div>
      <div class="rule-config-operation">
        <i
          class="el-icon-edit"
          @click="handleEditRuleConfig(ruleConfig)"
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
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { VueMasonryPlugin } from 'vue-masonry/dist/vue-masonry-plugin-umd'
import PreviewIcon from './preview-icon'
import createGUID from '@/utils/uuidv4'

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
            this.$proxyApi.deleteCustomizeRule(ruleConfig.guid)
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
    PreviewIcon
  }
}
</script>

<style scoped>
.rule-config-list .rule-config-item {
  position: relative;
  width: 200px;
  margin: 12px;
  box-shadow: 1px 1px 8px 1px #b9b9b9;
  padding-top: 30px;
  border-radius: 4px;
  user-select: none;
  overflow: hidden;
}
.rule-config-list .rule-config-item.disabled {
  background-color: #efefef;
}
.rule-config-list .rule-config-item .rule-config-operation {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #d7d7d7;
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
  font-size: 14px;
}
.rule-config-list .rule-config-item .rule-config-info {
  padding: 12px 8px;
  line-height: 24px;
  user-select: text;
}
.rule-config-list .rule-config-item .rule-config-tags {
  padding: 0 4px;
}
.rule-config-list .rule-config-item .rule-config-tags .rule-config-tag {
  display: inline-block;
  height: 18px;
  line-height: 18px;
  padding: 0 8px;
  margin: 4px;
  color: #409EFF;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  background-color: rgba(64,158,255,.1);
}
</style>
