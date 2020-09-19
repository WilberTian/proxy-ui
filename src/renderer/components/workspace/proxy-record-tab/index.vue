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
        <el-button type="danger" size="mini" icon="el-icon-delete" circle :disabled="recordCount === 0" @click="clearRecords"></el-button>
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
      :recordTreeData="recordTreeData"
    />
    <list-record-view
      v-if="displayMode === 'list'"
      :filterKeyword="filterKeyword"
      :hostsWithHttps="hostsWithHttps"
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

const throttle = require('lodash.throttle')

export default {
  data: function () {
    return {
      filterKeyword: '',
      displayMode: 'tree',
      hostsWithHttps: [],
      recordTreeData: [],
      listedRecords: []
    }
  },
  computed: {
    ...mapGetters({
      recordCount: 'getRecordCount'
    })
  },
  mounted () {
    this.noneReactiveRecordTreeData = {
      label: 'root',
      children: []
    }
    this.noneReactiveRecordsCount = 0
    this.noneReactiveListedRecord = []

    const treeRecordDataUpdater = throttle(() => {
      this.recordTreeData = [...this.noneReactiveRecordTreeData.children]
      this.$store.commit('setRecordCount', this.noneReactiveRecordsCount)
      this.$proxyApi.setTrayTitle(`${this.noneReactiveRecordsCount}`)
    }, 500)
    const listedRecordsUpdater = throttle(() => {
      this.listedRecords = [...this.noneReactiveListedRecord]
      this.$store.commit('setRecordCount', this.noneReactiveListedRecord.length)
      this.$proxyApi.setTrayTitle(`${this.noneReactiveListedRecord.length}`)
    }, 500)

    this.recordAppendHandler = (_, records) => {
      records.forEach(record => {
        insertTree(this.noneReactiveRecordTreeData, record)
      })
      this.noneReactiveRecordsCount += records.length
      treeRecordDataUpdater()

      records.forEach(record => {
        this.noneReactiveListedRecord.push(record)
      })
      listedRecordsUpdater()
    }
    this.recordUpdateHandler = (_, records) => {
      records.forEach(record => {
        const idx = this.noneReactiveListedRecord.findIndex(_record => {
          return _record.id === record.id
        })
        if (idx > -1) {
          this.noneReactiveListedRecord[idx] = record
        }
      })
      listedRecordsUpdater()
    }
    this.$ipcRenderer.on('record-append', this.recordAppendHandler)
    this.$ipcRenderer.on('record-update', this.recordUpdateHandler)

    this.recordClearHandler = () => {
      this.noneReactiveRecordTreeData = {
        label: 'root',
        children: []
      }
      this.noneReactiveRecordsCount = 0
      this.recordTreeData = []
      this.expendedKeys = []
      this.selectedRecordId = -1

      this.noneReactiveListedRecord = []
      this.listedRecords = []
    }
    eventBus.$on(events.CLEAR_RECORDS, this.recordClearHandler)

    this.filterRecordHandler = (filterKeyword) => {
      this.filterKeyword = filterKeyword
    }
    eventBus.$on(events.FILTER_RECORD, this.filterRecordHandler)

    this.httpsHostUpdated = () => {
      this.hostsWithHttps = this.$proxyApi.getHostsEnabledHttps()
    }
    this.$ipcRenderer.on('https-host-updated', this.httpsHostUpdated)
    this.httpsHostUpdated()
  },
  beforeDestroy () {
    eventBus.$off(events.CLEAR_RECORDS, this.recordClearHandler)
    eventBus.$off(events.FILTER_RECORD, this.filterRecordHandler)
    this.$ipcRenderer.removeListener('record-append', this.recordAppendHandler)
    this.$ipcRenderer.removeListener('https-host-updated', this.httpsHostUpdated)
  },
  methods: {
    clearRecords () {
      this.$proxyApi.clearRecords().then((num) => {
        this.$notify({
          title: '提示',
          message: `${num}条记录被删除！`,
          type: 'success',
          position: 'bottom-right'
        })

        this.$store.commit('setRecordCount', 0)
        this.$proxyApi.setTrayTitle('0')
        eventBus.$emit(events.CLEAR_RECORDS)
      }, (err) => {
        this.$notify({
          title: '错误信息',
          message: err,
          type: 'error',
          position: 'bottom-right'
        })
      })
    },
    processFilterHandler () {
      eventBus.$emit(events.FILTER_RECORD, this.filterKeyword)
    },
    resetFilterHandler () {
      this.filterKeyword = ''
      eventBus.$emit(events.FILTER_RECORD, '')
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
