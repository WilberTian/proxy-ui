<template>
  <div class="grouped-rule-config-list">
    <div class="rule-config-list-group" v-for="(tag, idx) in tagList" :key="idx">
      <div class="group-header">
        <div class="tag-name">
          {{tag}}
        </div>
        <div style="float: right; margin-right: 16px; padding: 2px">
          <el-button size="mini" @click="toggleRulesByTag(tag, true)" round>开启全部</el-button>
          <el-button size="mini" @click="toggleRulesByTag(tag, false)" round>禁用全部</el-button>
        </div>
      </div>
      <rule-config-list
        :ruleConfigs="groupedRuleConfigList[tag]"
        @editRuleConfig="handleEditRuleConfig"
      />
    </div>
  </div>
</template>

<script>
import RuleConfigList from './rule-config-list'
export default {
  props: {
    tags: {
      type: Array,
      default: function () {
        return []
      }
    },
    ruleConfigs: {
      type: Array
    }
  },
  computed: {
    tagList () {
      return ['N/A', ...this.tags]
    },
    groupedRuleConfigList () {
      const groupedRuleConfigList = {}
      this.tagList.forEach((tag) => {
        const result = this.ruleConfigs.filter((ruleConfig) => {
          return ruleConfig.tags.indexOf(tag) !== -1
        })
        if (result.length > 0) {
          groupedRuleConfigList[tag] = result
        }
      })
      const notTaggedList = this.ruleConfigs.filter((ruleConfig) => {
        return ruleConfig.tags.length === 0
      })
      if (notTaggedList.length > 0) {
        groupedRuleConfigList['N/A'] = notTaggedList
      }

      return groupedRuleConfigList
    }
  },
  methods: {
    handleEditRuleConfig (selectedRuleConfig) {
      this.$emit('editRuleConfig', selectedRuleConfig)
    },
    toggleRulesByTag (tag, status) {
      const taggedList = this.groupedRuleConfigList[tag]
      taggedList.forEach((ruleConfig) => {
        this.$store.commit('updateRuleConfig', {
          ...ruleConfig,
          enabled: status
        })
      })
    }
  },
  components: {
    RuleConfigList
  }
}
</script>

<style scoped>
.rule-config-list-group {
  margin-bottom: 16px;
}
.group-header {
  height: 32px;
  background-color: #ebeef5;
}
.group-header .tag-name {
  display: inline-block;
  color: #333;
  opacity: .8;
  font-weight: bold;
  line-height: 32px;
  padding: 0 8px;
}
</style>
