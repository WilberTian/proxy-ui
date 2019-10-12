<template>
  <div class="proxy-server-record">
    <record-filter @filterChange="handleFilterChange" />
    <group-record-view v-if="displayMode === 'group'" :filterData="filterData" @updateRecordList="recordUpdateHandler" @selectRecord="recordSelectHandler" />
    <list-record-view v-if="displayMode === 'list'" :filterData="filterData" @updateRecordList="recordUpdateHandler" @selectRecord="recordSelectHandler" />
    <div class="record-status">
      <div class="record-info">
        共 {{totalRecordsCount}} 条数据，已筛选 {{filteredRecordsCount}} 条数据
      </div>
      <el-radio-group v-model="displayMode" size="mini" :style="{position: 'absolute', right: '120px', top: '6px'}">
        <el-radio-button label="group">
          分组
        </el-radio-button>
        <el-radio-button label="list">
          列表
        </el-radio-button>
      </el-radio-group>
      <div class="clear-record-btn">
        <el-button type="danger" size="mini" :disabled="filteredRecordsCount === 0" @click="clearRecords">清空数据</el-button>
      </div>
    </div>
    <transition name="slide-fade">
      <record-detail v-if="showRecordDetail" :id="selectedRecordId" @close="showRecordDetail = false" />
    </transition>
    <div class="overlay" v-if="showRecordDetail" @click="showRecordDetail = false"></div>
  </div>
</template>

<script>
import RecordFilter from './record-filter'
import RecordDetail from './record-detail'
import GroupRecordView from './group-record-view'
import ListRecordView from './list-record-view'
import events from '@/configs/events'
import eventBus from '@/utils/event-bus'

export default {
  data: function () {
    return {
      filterData: {},
      showRecordDetail: false,
      selectedRecordId: -1,
      totalRecordsCount: 0,
      filteredRecordsCount: 0,
      displayMode: 'group'
    }
  },
  methods: {
    handleFilterChange (filterData) {
      this.filterData = filterData
    },
    recordUpdateHandler (data) {
      this.totalRecordsCount = data.totalCount
      this.filteredRecordsCount = data.filteredRecordsCount
    },
    recordSelectHandler (id) {
      this.selectedRecordId = id
      this.showRecordDetail = true
    },
    clearRecords () {
      this.$proxyApi.clearRecords().then((num) => {
        this.$notify({
          title: '提示',
          message: `${num}条记录被删除！`,
          type: 'success'
        })

        this.selectedRecordId = -1
        this.totalRecordsCount = 0
        this.filteredRecordsCount = 0
        eventBus.$emit(events.CLEAR_RECORDS, true)
      }, (err) => {
        this.$notify({
          title: '错误信息',
          message: err,
          type: 'error'
        })
      })
    }
  },
  components: {
    RecordFilter,
    RecordDetail,
    GroupRecordView,
    ListRecordView
  }
}
</script>

<style scoped>
.proxy-server-record {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.record-filter {
  padding: 10px;
  border-bottom: 1px solid #ccc;
  user-select: none;
}
.record-status {
  position: relative;
  height: 40px;
  box-shadow: 0 0 2px rgba(0,0,0,0.2);
  background-color: #fafafa;
}
.record-status .record-info {
  display: inline-block;
  line-height: 40px;
  margin-left: 8px;
  font-weight: bold;
  font-size: 14px;
}
.record-status .clear-record-btn {
  position: absolute;
  right: 8px;
  top: 6px;
}
.record-data-wrapper {
  flex: 1;
  display: flex;
}
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .3s ease;
}
.slide-fade-enter, .slide-fade-leave-active {
  transform: translate3d(200px, 0, 0);
  opacity: 0;
}
.overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: #333;
  opacity: .7;
  z-index: 900;
}
</style>
