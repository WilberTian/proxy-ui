<template>
  <div class="proxy-server-record">
    <record-filter @filterChange="handleFilterChange" />
    <div class="list-wrapper" v-if="filteredRecordLength > 0">
      <div class="list-item" v-for="record in pagedRecords" :key="record.id"> 
        <span class="id-column column" @click="openRecordDetail(record.id)">
          {{record.id}}
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
      v-if="filteredRecordLength > 0"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
      :current-page="currentPage"
      :page-sizes="[50, 100, 200, 300]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="filteredRecordLength">
    </el-pagination>
    <div
      class="no-record-msg"
      v-if="filteredRecordLength === 0"
    >
      当前没有数据！
    </div>
    <transition name="slide-fade" v-if="showRecordDetail">
      <record-detail :id="selectedRecordId" @close="showRecordDetail = false" />
    </transition>
  </div>
</template>

<script>
import RecordFilter from './record-filter'
import RecordDetail from './record-detail'

export default {
  data: function () {
    return {
      currentPage: 1,
      pageSize: 50,
      filterData: {},
      showRecordDetail: false,
      selectedRecordId: -1,
      filteredRecordLength: 0,
      pagedRecords: []
    }
  },
  beforeCreate () {
    this.filteredRecords = []
    this.recordIdx = 0
  },
  mounted () {
    this.recordUpdateListener = (forceUpdate = false) => {
      // const { method, host, path } = this.filterData
      this.$proxyApi.getLatestRecords(this.filterData).then((data) => {
        // const newRecords = data.slice(this.recordIdx, data.length).filter((item) => {
        //   let passed = true
        //   if (method) {
        //     passed = (item.method.toLowerCase().indexOf(method.toLowerCase()) > -1) && passed
        //     if (!passed) {
        //       return passed
        //     }
        //   }
        //   if (host) {
        //     passed = (item.host.toLowerCase().indexOf(host.toLowerCase()) > -1) && passed
        //     if (!passed) {
        //       return passed
        //     }
        //   }
        //   if (path) {
        //     passed = (item.path.toLowerCase().indexOf(path.toLowerCase()) > -1) && passed
        //     if (!passed) {
        //       return passed
        //     }
        //   }
        //   return passed
        // }).map((item) => {
        //   return {
        //     id: item.id,
        //     method: item.method,
        //     statusCode: item.statusCode,
        //     host: item.host,
        //     path: item.path
        //   }
        // })
        // Array.prototype.push.apply(this.filteredRecords, newRecords)
        // this.recordIdx += (data.length - this.recordIdx)

        this.filteredRecordLength = data.length

        if (forceUpdate || this.pagedRecords.length !== this.pageSize) {
          const start = (this.currentPage - 1) * this.pageSize
          this.pagedRecords = data.slice(start, start + this.pageSize)
        }
      }, (err) => {
        this.$message.error(err)
      })
    }
    this.$ipcRenderer.on('record-updated', this.recordUpdateListener)
    this.recordUpdateListener()
  },
  beforeDestroy () {
    this.$ipcRenderer.removeListener('record-updated', this.recordUpdateListener)
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
    handleFilterChange (filterData) {
      this.filterData = filterData
      this.recordUpdateListener(true)
    },
    openRecordDetail (id) {
      this.selectedRecordId = id
      this.showRecordDetail = true
    }
  },
  components: {
    RecordFilter,
    RecordDetail
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
  width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .3s ease;
}
.slide-fade-enter, .slide-fade-leave-active {
  transform: translate3d(200px,0,0);
  opacity: 0;
}
</style>
