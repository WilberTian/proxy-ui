<template>
  <div class="rule-config-filter">
    <div class="filter-item">
      <div class="filter-item-label">
        类型
      </div>
      <div class="filter-item-content">
        <el-radio-group v-model="selectedType" @change="changeSelectedType">
          <el-radio label="">all</el-radio>
          <el-radio label="mock">mock</el-radio>
          <el-radio label="response">response</el-radio>
          <el-radio label="request">request</el-radio>
        </el-radio-group>
      </div>
    </div>
    <div class="filter-item">
      <div class="filter-item-label">
        是否启用
      </div>
      <div class="filter-item-content">
        <el-radio-group v-model="enableStatus" @change="changeEnableStatus">
          <el-radio :label="-1">all</el-radio>
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
      selectedType: '',
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
    }
  }
}
</script>
<style scoped>
.filter-item {
  display: flex;
  align-content: center;
  margin: 12px 0;
}
.filter-item .filter-item-label {
  width: 100px;
  font-weight: bold;
}
.filter-item .filter-item-content .tag-item {
  display: inline-block;
  border-radius: 4px;
  color: #333;
  padding: 4px 8px;
}
.filter-item .filter-item-content .tag-item.selected {
  color: #fff;
  background: #409eff;
}
</style>