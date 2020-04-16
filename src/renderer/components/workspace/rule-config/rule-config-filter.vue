<template>
  <div class="rule-config-filter">
    <div class="filter-header" @click="toggleFilterItem">
      筛选规则 <i :class="showFilterItem ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"></i>
    </div>
    <transition name="slide-fade">
      <div class="filter-item-wrapper" v-show="showFilterItem">
        <div class="filter-item">
          <div class="filter-item-label">
            规则类型
          </div>
          <div class="filter-item-content">
            <el-radio-group v-model="selectedType" @change="changeSelectedType">
              <el-radio label="all">全部</el-radio>
              <el-radio label="mock">{{'mock' | ruleTypeConvertor}}</el-radio>
              <el-radio label="response">{{'response' | ruleTypeConvertor}}</el-radio>
              <el-radio label="request">{{'request' | ruleTypeConvertor}}</el-radio>
              <el-radio label="customize">{{'customize' | ruleTypeConvertor}}</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="filter-item">
          <div class="filter-item-label">
            是否启用
          </div>
          <div class="filter-item-content">
            <el-radio-group v-model="enableStatus" @change="changeEnableStatus">
              <el-radio :label="-1">全部</el-radio>
              <el-radio :label="1">开启</el-radio>
              <el-radio :label="0">未开启</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="filter-item">
          <div class="filter-item-label">
            标签
          </div>
          <div class="filter-item-content">
            <span :class="{'tag-item': true, 'selected': selectedTags.indexOf(tag) > -1}" v-for="(tag, idx) in tags" :key="idx" @click="toggleTagSelect(tag)">
              {{tag}}
            </span>
          </div>
        </div>
        <div style="float: right; margin-right: 16px;">
          <el-button size="mini" @click="enableSelectedRules" round>开启选中</el-button>
          <el-button size="mini" @click="disableSelectedRules" round>禁用选中</el-button>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    tags: {
      type: Array
    }
  },
  data () {
    return {
      showFilterItem: true,
      selectedType: 'all',
      enableStatus: -1,
      selectedTags: []
    }
  },
  methods: {
    changeSelectedType (type) {
      this.selectedType = type
      this.emitFilterChange()
    },
    changeEnableStatus (status) {
      this.enableStatus = status
      this.emitFilterChange()
    },
    toggleTagSelect (tag) {
      const tagIdx = this.selectedTags.indexOf(tag)
      if (tagIdx === -1) {
        this.selectedTags.push(tag)
      } else {
        this.selectedTags.splice(tagIdx, 1)
      }
      this.emitFilterChange()
    },
    emitFilterChange () {
      const filterData = {}
      if (this.selectedType !== 'all') {
        filterData.selectedType = this.selectedType
      }
      if (this.enableStatus !== -1) {
        filterData.enableStatus = !!this.enableStatus
      }
      if (this.selectedTags.length > 0) {
        filterData.selectedTags = this.selectedTags
      }

      this.$emit('filterChange', filterData)
    },
    toggleFilterItem () {
      this.showFilterItem = !this.showFilterItem
    },
    enableSelectedRules () {
      this.$emit('enableSelected')
    },
    disableSelectedRules () {
      this.$emit('disableSelected')
    }
  }
}
</script>
<style scoped>
.filter-header {
  padding: 0 4px;
  font-weight: bold;
  color: #333;
  text-align: right;
  cursor: pointer;
}
.filter-item-wrapper {
  border-top: 1px solid #efefef;
  margin-top: 6px;
}
.filter-item {
  display: flex;
  align-content: center;
  margin: 10px 0;
  height: 24px;
  line-height: 24px;
  font-size: 14px;
}
.filter-item .filter-item-label {
  width: 80px;
  color: #444;
  margin-right: 20px;
  text-align: right;
}
.filter-item .filter-item-content .tag-item {
  display: inline-block;
  height: 20px;
  line-height: 20px;
  border-radius: 4px;
  color: #333;
  font-size: 14px;
  padding: 0 8px;
  margin-right: 8px;
  cursor: pointer;
}
.filter-item .filter-item-content .tag-item.selected {
  color: #fff;
  background: #409eff;
}
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .1s ease;
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(-60px);
  opacity: 0;
}
</style>