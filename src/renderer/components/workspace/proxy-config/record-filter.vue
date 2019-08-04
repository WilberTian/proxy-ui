<template>
  <div class="record-filter">
    <div class="filter-header" @click="toggleFilterItem">
      筛选数据 <i :class="showFilterItem ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"></i>
    </div>
    <transition name="slide-fade">
      <div class="filter-wrapper" v-show="showFilterItem">
        <div class="filter-item-wrapper">
          <div class="filter-item">
            <div class="filter-item-label">
              Method
            </div>
            <div class="filter-item-content">
              <el-input v-model="method" placeholder="method" size="mini"></el-input>
            </div>
          </div>
          <div class="filter-item">
            <div class="filter-item-label">
              Host
            </div>
            <div class="filter-item-content">
              <el-input v-model="host" placeholder="host" size="mini"></el-input>
            </div>
          </div>
          <div class="filter-item">
            <div class="filter-item-label">
              Path
            </div>
            <div class="filter-item-content">
              <el-input v-model="path" placeholder="path" size="mini"></el-input>
            </div>
          </div>
        </div>
        <div class="btn-group">
          <el-button type="primary" size="mini" round @click="emitFilterChange">查询</el-button>
          <el-button size="mini" round @click="resetFilterData">重置</el-button>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  data: function () {
    return {
      showFilterItem: false,
      method: '',
      host: '',
      path: ''
    }
  },
  methods: {
    emitFilterChange () {
      this.$emit('filterChange', {
        method: this.method,
        host: this.host,
        path: this.path
      })
    },
    toggleFilterItem () {
      this.showFilterItem = !this.showFilterItem
    },
    resetFilterData () {
      this.method = ''
      this.host = ''
      this.path = ''
      this.emitFilterChange()
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
.filter-wrapper {
  border-top: 1px solid #efefef;
  margin-top: 6px;
}
.filter-wrapper .btn-group {
  margin-top: 10px;
  margin-left: 100px;
}
.filter-item-wrapper {
  display: flex;
  flex-wrap: wrap;
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
  border: 1px solid #d7d7d7;
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