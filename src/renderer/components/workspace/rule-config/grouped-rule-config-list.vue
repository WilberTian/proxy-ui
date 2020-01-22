<template>
  <div class="grouped-rule-config-list">
    <div v-for="(tagItem, idx) in tagList" :key="idx">
      <div class="rule-config-list-group" v-if="groupedRuleConfigList[tagItem.tag] && groupedRuleConfigList[tagItem.tag].length > 0">
        <div class="group-header">
          <div class="tag-name">
            {{tagItem.tag}} （{{groupedRuleConfigList[tagItem.tag].length}}条）
          </div>
          <div style="float: right; margin-right: 12px; padding: 2px">
            <el-button v-show="!tagItem.folded" size="mini" @click="toggleRulesByTag(tagItem.tag, true)" round>开启全部</el-button>
            <el-button v-show="!tagItem.folded" size="mini" @click="toggleRulesByTag(tagItem.tag, false)" round>禁用全部</el-button>
            <el-button
              size="mini"
              :icon="tagItem.folded ? 'el-icon-arrow-right' : 'el-icon-arrow-down'"
              @click="toggleRuleConfigList(tagItem.tag)"
            circle></el-button>
          </div>
        </div>
        <transition name="slide-fade">
          <rule-config-list
            v-show="!tagItem.folded"
            :ruleConfigs="groupedRuleConfigList[tagItem.tag]"
            @editRuleConfig="handleEditRuleConfig"
          />
        </transition>
      </div>
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
  data () {
    return {
      tagList: []
    }
  },
  watch: {
    tags: {
      handler (val) {
        const tagList = val.map((tag) => {
          return {
            tag,
            folded: false
          }
        })
        tagList.unshift({
          tag: 'N/A',
          folded: false
        })
        this.tagList = tagList
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    groupedRuleConfigList () {
      const groupedRuleConfigList = {}
      this.tagList.forEach((tagItem) => {
        const result = this.ruleConfigs.filter((ruleConfig) => {
          return ruleConfig.tags.indexOf(tagItem.tag) !== -1
        })
        if (result.length > 0) {
          groupedRuleConfigList[tagItem.tag] = result
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
    },
    toggleRuleConfigList (tag) {
      const foundIdx = this.tagList.findIndex((tagItem) => {
        return tagItem.tag === tag
      })
      const updatedItem = {
        tag,
        folded: !this.tagList[foundIdx].folded
      }
      this.$set(this.tagList, foundIdx, updatedItem)
    }
  },
  components: {
    RuleConfigList
  }
}
</script>

<style scoped>
.rule-config-list {
  padding-bottom: 16px;
}
.group-header {
  height: 32px;
  background-color: #ebeef5;
  border-bottom: 1px solid #e1e1e1;
}
.group-header .tag-name {
  display: inline-block;
  color: #333;
  opacity: .8;
  font-weight: bold;
  line-height: 32px;
  padding: 0 8px;
}
.slide-fade-enter-active {
  transition: all .2s ease-in;
}
.slide-fade-leave-active {
  transition: all .1s ease-in;
}
.slide-fade-enter, .slide-fade-leave-active {
  opacity: 0;
}
</style>
