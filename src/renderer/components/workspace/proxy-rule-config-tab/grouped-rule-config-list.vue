<template>
  <div class="grouped-rule-config-list">
    <div v-for="(tagItem, idx) in tagList" :key="idx">
      <div class="rule-config-list-group" v-if="groupedRuleConfigList[tagItem.tag] && groupedRuleConfigList[tagItem.tag].length > 0">
        <div :class="{'group-header': true, 'folded-item': tagItem.folded}" @click="toggleRuleConfigList(tagItem.tag)">
          <div class="tag-name">
            {{tagItem.tag}} （{{groupedRuleConfigList[tagItem.tag].length}}条）
          </div>
          <div class="tag-btns">
            <el-button v-show="!tagItem.folded" size="mini" @click.stop="toggleRulesByTag(tagItem.tag, true)" round>开启全部</el-button>
            <el-button v-show="!tagItem.folded" size="mini" @click.stop="toggleRulesByTag(tagItem.tag, false)" round>禁用全部</el-button>
            <i :class="tagItem.folded ? 'el-icon-arrow-right' : 'el-icon-arrow-down'" />
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
const NA = 'N/A'

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
            folded: !!window.localStorage.getItem(`tag-${tag}`)
          }
        })
        tagList.unshift({
          tag: NA,
          folded: !!window.localStorage.getItem(`tag-${NA}`)
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
      const ruleConfigs = taggedList.map((ruleConfig) => {
        return {
          ...ruleConfig,
          enabled: status
        }
      })
      this.$proxyApi.updateRuleConfigs(ruleConfigs)
    },
    toggleRuleConfigList (tag) {
      const foundIdx = this.tagList.findIndex((tagItem) => {
        return tagItem.tag === tag
      })
      const currentStatus = this.tagList[foundIdx].folded
      currentStatus ? window.localStorage.removeItem(`tag-${tag}`) : window.localStorage.setItem(`tag-${tag}`, '1')
      const updatedItem = {
        tag,
        folded: !!window.localStorage.getItem(`tag-${tag}`)
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
  display: flex;
  align-items: center;
  height: 32px;
  cursor: pointer;
  background-color: #eee;
}
.group-header.folded-item {
  border-bottom: 1px solid #d7d7d7;
  background-color: #fff;
}
.group-header .tag-name {
  flex: 1;
  display: inline-block;
  color: #333;
  opacity: .8;
  font-weight: bold;
  padding: 0 8px;
}
.group-header .tag-btns i {
  margin: 0 8px;
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
