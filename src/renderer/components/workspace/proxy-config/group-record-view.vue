<template>
  <div class="record-data-wrapper">
    <div class="host-list" :style="{width: `${hostListWidth}px`}">
      <div
        v-for="(host, idx) in hostList"
        :key="idx"
        :class="{'selected-host': host === selectedHost, 'host-item': true}"
        @click="handleHostChange(host)"
      >
        {{host}}
        <i v-if="host === selectedHost" class="el-icon-arrow-right"></i>
      </div>
    </div>
    <div class="dividor" @mousedown.stop.prevent="handleCursorDown"></div>
    <div class="host-records">
      <div class="list-wrapper" v-if="recordsByHostCount > 0">
        <div class="list-item" v-for="(record, idx) in pagedRecords" :key="record.id"> 
          <span class="id-column column" @click="openRecordDetail(record.id)">
            {{idx + 1}}
          </span>
          <span class="method-column column">
            {{record.method}}
          </span>
          <span class="status-column column">
            {{record.statusCode}}
          </span>
          <span class="path-column column">
            {{record.path}}
          </span>
        </div>
      </div>
      <el-pagination
        small
        v-if="recordsByHostCount > 0"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        :current-page="currentPage"
        :page-sizes="[50, 100, 200, 300]"
        :page-size="pageSize"
        :pager-count="5"
        layout="total, sizes, prev, pager, next, jumper"
        :total="recordsByHostCount"
      >
      </el-pagination>
      <div
        class="no-record-msg"
        v-if="recordsByHostCount === 0"
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
  created () {
    this.isCursorMove = false
    this.mouseOffX = 0
  },
  mounted () {
    this.recordUpdateListener = (forceUpdate = false) => {
      this.$proxyApi.getLatestRecords(this.filterData).then((data) => {
        this.$emit('updateRecordList', {
          totalCount: data.totalCount,
          filteredRecordsCount: data.filteredRecordsCount
        })
        const filteredGroupRecords = data.filteredGroupRecords
        this.hostList = Object.keys(filteredGroupRecords)
        if (this.hostList === 0) {
          this.selectedHost = ''
          this.hostList = []
          this.pagedRecords = []
          this.recordsByHostCount = 0
          this.currentPage = 1
          return
        }

        if (this.selectedHost) {
          const recordsByHost = filteredGroupRecords[this.selectedHost]
          if (recordsByHost) {
            this.recordsByHostCount = recordsByHost.length
            if (forceUpdate || this.pagedRecords.length !== this.pageSize) {
              const start = (this.currentPage - 1) * this.pageSize
              this.pagedRecords = recordsByHost.slice(start, start + this.pageSize)
            }
          } else {
            this.recordsByHostCount = 0
            this.pagedRecords = []
          }
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
      recordsByHostCount: 0,
      pagedRecords: [],
      selectedHost: '',
      hostList: [],
      hostListWidth: 180
    }
  },
  methods: {
    handleCursorDown (e) {
      this.isCursorMove = true
      this.mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft
      this.lastMouseX = this.mouseX
      document.documentElement.addEventListener('mousemove', this.handleCursorMove, true)
      document.documentElement.addEventListener('mouseup', this.handleCursorUp, true)
    },
    handleCursorMove (e) {
      this.mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft
      let diffX = this.mouseX - this.lastMouseX
      this.mouseOffX = 0

      this.lastMouseX = this.mouseX
      if (this.isCursorMove) {
        this.hostListWidth += diffX
      }
    },
    handleCursorUp () {
      this.isCursorMove = false
      document.documentElement.removeEventListener('mousemove', this.handleCursorMove, true)
      document.documentElement.removeEventListener('mouseup', this.handleCursorUp, true)
    },
    handlePageChange (currentPage) {
      this.currentPage = currentPage
      this.recordUpdateListener(true)
    },
    handleSizeChange (size) {
      this.pageSize = size
      this.recordUpdateListener(true)
    },
    handleHostChange (host) {
      this.selectedHost = host
      this.recordUpdateListener(true)
    },
    openRecordDetail (id) {
      this.$emit('selectRecord', id)
    }
  }
}
</script>
<style scoped>
.host-list {
  height: 100%;
  overflow-y: auto;
  font-size: 13px;
  color: #333;
  flex-shrink: 0;
}
.host-list .host-item {
  position: relative;
  cursor: pointer;
  height: 24px;
  line-height: 24px;
  padding: 0px 6px;
  border-bottom: 1px solid #ccc;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.host-list .host-item.selected-host {
  background: #409eff;
  color: #fff;
  font-weight: bold;
}
.host-list .host-item.selected-host i {
  position: absolute;
  right: 0;
  right: 0;
  top: 6px;
  font-weight: bold;
  background: #409eff;
}
.dividor {
  width: 3px;
  height: 100%;
  background: #333;
  flex-shrink: 0;
  cursor: col-resize;
  opacity: .8;
  border-radius: 40px;
}
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