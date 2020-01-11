<template>
  <div class="record-data-wrapper">
    <div class="host-records">
      <div class="list-wrapper" v-if="recordsCount > 0">
        <div class="list-item" v-for="(record, idx) in pagedRecords" :key="record.id"> 
          <span class="id-column column" @click="openRecordDetail(record.id)">
            {{(currentPage - 1) * pageSize + 1 + idx}}
          </span>
          <span class="method-column column">
            {{record.method}}
          </span>
          <span class="status-column column">
            {{record.statusCode}}
          </span>
           <span class="host-column column">
            {{record.host}}
          </span>
          <span class="path-column column">
            {{record.path}}
          </span>
        </div>
      </div>
      <el-pagination
        small
        v-if="recordsCount > 0"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        :current-page="currentPage"
        :page-sizes="[50, 100, 200, 300]"
        :page-size="pageSize"
        :pager-count="5"
        layout="sizes, prev, pager, next, jumper"
        :total="recordsCount"
      >
      </el-pagination>
      <div
        class="no-record-msg"
        v-if="recordsCount === 0"
      >
        当前没有数据！
      </div>
    </div>
  </div>
</template>
<script>
import events from '@/configs/events'
import eventBus from '@/utils/event-bus'

export default {
  props: {
    filterData: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  watch: {
    filterData: {
      deep: true,
      handler: function (val) {
        this.recordUpdateListener(true)
      }
    }
  },
  mounted () {
    this.recordUpdateListener = (forceUpdate = false) => {
      this.$proxyApi.getLatestRecords(this.filterData).then((data) => {
        this.$emit('updateRecordList', {
          totalCount: data.totalCount,
          filteredRecordsCount: data.filteredRecordsCount
        })
        const filteredListRecords = data.filteredListRecords

        if (filteredListRecords.length === 0) {
          this.pagedRecords = []
          this.currentPage = 1
          this.recordsCount = 0
          return
        }

        this.recordsCount = filteredListRecords.length
        if (forceUpdate || this.pagedRecords.length !== this.pageSize) {
          const start = (this.currentPage - 1) * this.pageSize
          this.pagedRecords = filteredListRecords.slice(start, start + this.pageSize)
        }
      }, (err) => {
        this.$message.error(err)
      })
    }
    this.$ipcRenderer.on('record-updated', this.recordUpdateListener)
    eventBus.$on(events.CLEAR_RECORDS, this.recordUpdateListener)
    this.recordUpdateListener()
  },
  beforeDestroy () {
    this.$ipcRenderer.removeListener('record-updated', this.recordUpdateListener)
    eventBus.$off(events.CLEAR_RECORDS, this.recordUpdateListener)
  },
  data: function () {
    return {
      currentPage: 1,
      pageSize: 50,
      pagedRecords: [],
      recordsCount: 0
    }
  },
  methods: {
    handlePageChange (currentPage) {
      this.currentPage = currentPage
      this.recordUpdateListener(true)
    },
    handleSizeChange (size) {
      this.pageSize = size
      this.recordUpdateListener(true)
    },
    openRecordDetail (id) {
      this.$emit('selectRecord', id)
    }
  }
}
</script>
<style scoped>
.host-records {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.list-wrapper {
  flex: 1;
  overflow-y: auto;
  font-size: 12px;
  color: #333;
}
.list-item {
  display: flex;
  height: 24px;
  line-height: 24px;
}
.list-item:nth-child(2n+1) {
  background-color: #efefef;
}
.list-item .column {
  padding: 0 4px;
}
.id-column {
  width: 40px;
  text-decoration: underline;
  text-align: center;
  background-color: #606266;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
}
.method-column {
  width: 80px;
}
.status-column {
  width: 40px;
}
.host-column {
  width: 180px;
}
.path-column {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.el-pagination {
  border-top: 1px solid #ccc;
  padding: 4px;
  text-align: center;
}
.proxy-server-record .no-record-msg {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #999;
}
</style>