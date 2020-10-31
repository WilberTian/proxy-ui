<template>
  <div class="proxy-server-record">
    <div class="record-status-toolbar">
      <el-radio-group v-model="displayMode" size="mini">
        <el-radio-button label="tree">
          分组
        </el-radio-button>
        <el-radio-button label="list">
          列表
        </el-radio-button>
      </el-radio-group>
      <div class="clear-record-btn">
        <el-button type="danger" size="mini" icon="el-icon-delete" :disabled="recordCount === 0" @click="clearRecords"></el-button>
      </div>
      <div class="block-placeholder" />
      <div class="record-filter">
        <el-input size="mini" style="width: 200px; margin-right: 16px;" v-model="filterKeyword" />
        <el-button size="mini" type="primary" @click="processFilterHandler">查询</el-button>
        <el-button size="mini" @click="resetFilterHandler">重置</el-button>
      </div>
    </div>
    <tree-record-view
      v-if="displayMode === 'tree'"
      :filterKeyword="filterKeyword"
      :hostsWithHttps="hostsWithHttps"
      :hostsDisabledCache="hostsDisabledCache"
      :recordTreeData="recordTreeData"
      :updatedHosts="updatedHosts"
      :deleteRecordsByHost="deleteRecordsByHost"
    />
    <list-record-view
      v-if="displayMode === 'list'"
      :filterKeyword="filterKeyword"
      :hostsWithHttps="hostsWithHttps"
      :hostsDisabledCache="hostsDisabledCache"
      :listedRecords="listedRecords"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import events from '@/configs/events'
import eventBus from '@/utils/event-bus'
import TreeRecordView from './tree-record-view'
import ListRecordView from './list-record-view'
import {insertTree} from './record-tree'
import showNotification from '@/utils/show-notification'

const throttle = require('lodash.throttle')

export default {
  data: function () {
    return {
      filterKeyword: '',
      displayMode: 'tree',
      hostsWithHttps: [],
      hostsDisabledCache: [],
      recordTreeData: [],
      listedRecords: [],
      updatedHosts: []
    }
  },
  computed: {
    ...mapGetters({
      recordCount: 'getRecordCount'
    })
  },
  mounted () {
    this.recordClearHandler()

    this.treeRecordDataUpdater = throttle(() => {
      this.recordTreeData = [...this.noneReactiveRecordTreeData.children]
      this.listedRecords = [...this.noneReactiveRecordTreeData.leaves]
      this.updatedHosts = [...this.noneReactiveRecordTreeData.updatedHosts]
      this.noneReactiveRecordTreeData.updatedHosts.length = 0
      this.updateRecordCount(this.listedRecords.length)
    }, 500)

    this.recordAppendHandler = (_, records) => {
      records.forEach(record => {
        insertTree(this.noneReactiveRecordTreeData, record)
      })
      this.treeRecordDataUpdater()
    }
    this.recordUpdateHandler = (_, records) => {
      const recordList = [...this.recordsForUpdate, ...records]
      this.recordsForUpdate.length = 0
      recordList.forEach(record => {
        const found = this.noneReactiveRecordTreeData.leaves.find(_record => {
          return _record.id === record.id
        })
        if (found) {
          found.statusCode = record.statusCode
        } else {
          this.recordsForUpdate.push(record)
        }
      })
      this.treeRecordDataUpdater()
    }
    this.$ipcRenderer.on('record-append', this.recordAppendHandler)
    this.$ipcRenderer.on('record-update', this.recordUpdateHandler)

    this.filterRecordHandler = (filterKeyword) => {
      this.filterKeyword = filterKeyword
    }
    eventBus.$on(events.FILTER_RECORD, this.filterRecordHandler)

    this.httpsHostUpdated = () => {
      this.hostsWithHttps = this.$proxyApi.getHostsEnabledHttps()
    }
    this.$ipcRenderer.on('https-host-updated', this.httpsHostUpdated)
    this.httpsHostUpdated()

    this.hostsDisabledCacheUpdated = () => {
      this.hostsDisabledCache = this.$proxyApi.getHostsDisabledCache()
    }
    this.$ipcRenderer.on('disable-cache-updated', this.hostsDisabledCacheUpdated)
    this.hostsDisabledCacheUpdated()

    this.$ipcRenderer.on('proxy-server-status-updated', this.recordClearHandler)
  },
  beforeDestroy () {
    this.recordClearHandler()
    eventBus.$off(events.FILTER_RECORD, this.filterRecordHandler)
    this.$ipcRenderer.removeListener('record-append', this.recordAppendHandler)
    this.$ipcRenderer.removeListener('record-update', this.recordUpdateHandler)
    this.$ipcRenderer.removeListener('https-host-updated', this.httpsHostUpdated)
    this.$ipcRenderer.removeListener('disable-cache-updated', this.hostsDisabledCacheUpdated)
    this.$ipcRenderer.removeListener('proxy-server-status-updated', this.recordClearHandler)
  },
  methods: {
    clearRecords () {
      this.$proxyApi.clearRecords().then((num) => {
        showNotification('提示', {
          body: `${num}条记录被删除！`,
          tag: 'simple-notification'
        },
        4000)

        this.recordClearHandler()
      }, (err) => {
        showNotification('错误信息', {
          body: err,
          tag: 'simple-notification'
        },
        4000)
      })
    },
    processFilterHandler () {
      eventBus.$emit(events.FILTER_RECORD, this.filterKeyword)
    },
    resetFilterHandler () {
      this.filterKeyword = ''
      eventBus.$emit(events.FILTER_RECORD, '')
    },
    updateRecordCount (count) {
      this.$store.commit('setRecordCount', count)
      this.$proxyApi.setTrayTitle(count === 0 ? '' : `${count}`)
    },
    recordClearHandler () {
      this.noneReactiveRecordTreeData = {
        label: 'root',
        children: [],
        leaves: [],
        updatedHosts: []
      }
      this.recordTreeData = []
      this.listedRecords = []
      this.recordsForUpdate = []
      this.selectedRecordId = -1
      this.updateRecordCount(0)
    },
    deleteRecordsByHost (host, isOpposite = false) {
      this.noneReactiveRecordTreeData.children = this.noneReactiveRecordTreeData.children.filter((item) => {
        return isOpposite ? item.host === host : item.host !== host
      })
      this.noneReactiveRecordTreeData.leaves = this.noneReactiveRecordTreeData.leaves.filter((item) => {
        return isOpposite ? item.host === host : item.host !== host
      })
      this.noneReactiveRecordTreeData.updatedHosts = this.noneReactiveRecordTreeData.updatedHosts.filter((item) => {
        return isOpposite ? item.host === host : item.host !== host
      })
      this.treeRecordDataUpdater()
    },
    deleteRecordsById (recordId, isOpposite = false) {
      //
    }
  },
  components: {
    TreeRecordView,
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
.record-status-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 40px;
  box-shadow: 0 0 2px rgba(0,0,0,0.2);
  background-color: #fafafa;
  z-index: 1;
}
.clear-record-btn {
  margin-left: 28px;
}
.block-placeholder {
  flex: 1;
}
</style>
