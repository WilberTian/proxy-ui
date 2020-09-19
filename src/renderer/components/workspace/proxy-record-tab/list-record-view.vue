<template>
  <div class="record-data-wrapper">
    <div class="listed-records" :style="{height: `${listedRecordContainerHeight}px`}">
      <div class="list-wrapper" v-if="listedRecords.length > 0">
        <div
          v-for="(record, idx) in listedRecords"
          :key="record.id"
          :class="{'list-item': true, 'selected-list-item': selectedRecordId === record.id}"
          v-show="`${record.host}${record.path}`.includes(filterKeyword)"
          @click="selectRecord(record.id)"
        > 
          <span class="id-column column">
            {{idx + 1}}
          </span>
          <span class="icon-column column">
            <i v-if="record.protocol === 'https' && !hostsWithHttps.includes(`${record.host}:443`)" class="el-icon-lock lock-icon" @click.prevent.stop="enableHttps4Host(`${record.host}:443`)"></i>
            <i v-if="record.protocol === 'https' && hostsWithHttps.includes(`${record.host}:443`)" class="el-icon-unlock lock-icon"></i>
            <i v-if="record.protocol !== 'https'" class="el-icon-link lock-icon"></i>
          </span>
          <span class="method-column column">
            {{record.method}}
          </span>
          <span class="status-column column">
            {{record.statusCode}}
          </span>
          <span class="host-column column" :title="`${record.protocol}://${record.host}`">
            {{`${record.protocol}://${record.host}`}}
          </span>
          <span class="path-column column" :title="record.path">
            {{record.path}}
          </span>
        </div>
      </div>
      <div
        class="no-record-msg"
        v-if="listedRecords.length === 0"
      >
        当前没有网络数据！
      </div>
    </div>
    <div :class="{'dividor': true, 'active': isCursorMove}" @mousedown.stop.prevent="handleCursorDown"></div>
    <div class="record-detail-wrapper">
      <record-detail v-if="selectedRecordId !== -1" :id="selectedRecordId" />
      <div
        class="no-selected-record"
        v-if="selectedRecordId === -1"
      >
        没有选中网络数据！
      </div>
    </div>
  </div>
</template>
<script>
import RecordDetail from './record-detail'

export default {
  props: {
    filterKeyword: {
      type: String,
      default: ''
    },
    hostsWithHttps: {
      type: Array,
      default: function () {
        return []
      }
    },
    listedRecords: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data: function () {
    return {
      selectedRecordId: -1,
      isCursorMove: false,
      listedRecordContainerHeight: 240
    }
  },
  created () {
    this.mouseOffY = 0
  },
  methods: {
    handleCursorDown (e) {
      this.isCursorMove = true
      this.mouseY = e.pageY || e.clientY + document.documentElement.scrollTop
      this.lastMouseY = this.mouseY
      document.documentElement.addEventListener('mousemove', this.handleCursorMove, true)
      document.documentElement.addEventListener('mouseup', this.handleCursorUp, true)
    },
    handleCursorMove (e) {
      this.mouseY = e.pageY || e.clientY + document.documentElement.scrollTop
      let diffY = this.mouseY - this.lastMouseY
      this.mouseOffY = 0

      this.lastMouseY = this.mouseY
      if (this.isCursorMove) {
        if ((this.listedRecordContainerHeight + diffY) >= 100 && (this.listedRecordContainerHeight + diffY) <= 600) {
          this.listedRecordContainerHeight += diffY
        }
      }
    },
    handleCursorUp () {
      this.isCursorMove = false
      document.documentElement.removeEventListener('mousemove', this.handleCursorMove, true)
      document.documentElement.removeEventListener('mouseup', this.handleCursorUp, true)
    },
    selectRecord (id) {
      this.selectedRecordId = id
    },
    enableHttps4Host (host) {
      this.$proxyApi.enableHttps4Host(host)
    }
  },
  components: {
    RecordDetail
  }
}
</script>
<style scoped>
.record-data-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.listed-records {
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
  cursor: pointer;
  background-color: #fff;
}
.selected-list-item {
  background-color: #777 !important;
  color: #fff;
}
.list-item:nth-child(2n+1) {
  background-color: #efefef;
}
.list-item .column {
  padding: 0 4px;
}
.list-item .column i.lock-icon {
  font-weight: bold;
  font-size: 14px;
  padding: 5px 4px;
}
.list-item .column i.el-icon-lock {
  color: #777;
  cursor: pointer;
}
.list-item .column i.el-icon-unlock {
  color: rgb(103, 194, 58);
  cursor: default;
}
.list-item .column i.el-icon-link {
  color: rgb(103, 194, 58);
  cursor: default;
}
.id-column {
  width: 40px;
  text-align: center;
  color: #333;
  font-weight: bold;
}
.method-column {
  width: 80px;
}
.status-column {
  width: 40px;
}
.host-column {
  width: 180px;
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
.proxy-server-record .no-record-msg {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #999;
}
.dividor {
  position: relative;
  height: 6px;
  width: 100%;
  background: transparent;
  cursor: row-resize;
}
.dividor::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #999;
}
.dividor.active::after {
  background: #3a8ee6;
}
.dividor:hover::after {
  background: #3a8ee6;
}
.record-detail-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.proxy-server-record .no-selected-record {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #999;
}
</style>