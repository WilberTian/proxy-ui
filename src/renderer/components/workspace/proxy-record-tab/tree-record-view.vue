<template>
  <div class="record-data-wrapper">
    <div class="record-tree" :style="{width: `${treeContainerWidth}px`}">
      <el-tree
        empty-text="当前没有网络数据！"
        :data="recordTreeData"
        :default-expanded-keys="expendedKeys"
        :auto-expand-parent="false"
        node-key="key"
        @node-expand="nodeExpandHandler"
        @node-collapse="nodeCollapseHandler"
        @node-click="nodeClickHandler"
        :render-content="renderRecordNode"
      ></el-tree>     
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
    <context-menu id="host-context-menu" ref="hostCtxMenu">
      <li
        v-if="selectedHostStatus.isHttps"
        :class="{'checked': selectedHostStatus.enableHttps}"
        @click="(e) => {
          if (selectedHostStatus.enableHttps) {
            this.disableHttps4Host(e, selectedHostStatus.host)
          } else {
            this.enableHttps4Host(e, selectedHostStatus.host)
          }
        }"
      >
        开启HTTPS
      </li>
      <li
        :class="{'checked': selectedHostStatus.disableCache}"
        @click="(e) => {
          if (selectedHostStatus.disableCache) {
            this.restCache4Host(e, selectedHostStatus.host)
          } else {
            this.disableCache4Host(e, selectedHostStatus.host)
          }
        }"
      >禁用缓存</li>
      <li @click.stop.prevent="deleteRecordsByHost(selectedHostStatus.host)">删除该记录</li>
      <li @click.stop.prevent="deleteRecordsByHost(selectedHostStatus.host, true)">删除其他记录</li>
    </context-menu>
  </div>
</template>
<script>
import contextMenu from 'vue-context-menu'
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
    hostsDisabledCache: {
      type: Array,
      default: function () {
        return []
      }
    },
    recordTreeData: {
      type: Array,
      default: function () {
        return []
      }
    },
    deleteRecordsByHost: {
      type: Function,
      default: () => {}
    }
  },
  data: function () {
    return {
      isCursorMove: false,
      treeContainerWidth: 240,
      expendedKeys: [],
      selectedRecordId: -1,
      selectedHostStatus: {
        isHttps: false,
        enableHttps: false,
        disableCache: false,
        host: ''
      }
    }
  },
  watch: {
    recordTreeData: function (val) {
      if (val.length === 0) {
        this.expendedKeys = []
      }
    }
  },
  created () {
    this.mouseOffX = 0
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
        if ((this.treeContainerWidth + diffX) >= 100 && (this.treeContainerWidth + diffX) <= 600) {
          this.treeContainerWidth += diffX
        }
      }
    },
    handleCursorUp () {
      this.isCursorMove = false
      document.documentElement.removeEventListener('mousemove', this.handleCursorMove, true)
      document.documentElement.removeEventListener('mouseup', this.handleCursorUp, true)
    },
    enableHttps4Host (e, host) {
      e.preventDefault()
      e.stopPropagation()
      this.$proxyApi.enableHttps4Host(host)
    },
    disableHttps4Host (e, host) {
      e.preventDefault()
      e.stopPropagation()
      this.$proxyApi.disableHttps4Host(host)
    },
    disableCache4Host (e, host) {
      e.preventDefault()
      e.stopPropagation()
      this.$proxyApi.disableCache4Host(host)
    },
    restCache4Host (e, host) {
      e.preventDefault()
      e.stopPropagation()
      this.$proxyApi.restCache4Host(host)
    },
    nodeExpandHandler (node) {
      if (!this.expendedKeys.includes(node.key)) {
        this.expendedKeys.push(node.key)
      }
    },
    nodeCollapseHandler (node) {
      if (this.expendedKeys.includes(node.key)) {
        this.expendedKeys = this.expendedKeys.filter(key => {
          return key !== node.key
        })
      }
    },
    nodeClickHandler (node) {
      if ('id' in node) {
        this.selectedRecordId = node.id
      } else {
        this.selectedRecordId = -1
      }
    },
    renderRecordNode (h, { node, data, store }) {
      const self = this
      let selectedHostStatus = {
        isHttps: false,
        enableHttps: false,
        disableCache: false,
        host: ''
      }
      const nodeConfig = {
        class: ['record-tree-node']
      }
      const iconConfig = {
        class: ['tree-node-icon', 'el-icon-folder-opened']
      }
      if (node.level === 1) {
        if (node.label.startsWith('https')) {
          if (this.hostsWithHttps.includes(data.host)) {
            iconConfig.class = ['tree-node-icon', 'el-icon-unlock']
            iconConfig.on = {
              click: (e) => {
                self.disableHttps4Host(e, data.host)
              }
            }
            selectedHostStatus.isHttps = true
            selectedHostStatus.enableHttps = true
          } else {
            iconConfig.class = ['tree-node-icon', 'el-icon-lock']
            iconConfig.on = {
              click: (e) => {
                self.enableHttps4Host(e, data.host)
              }
            }
            selectedHostStatus.isHttps = true
            selectedHostStatus.enableHttps = false
          }
        } else {
          iconConfig.class = ['tree-node-icon', 'el-icon-link']
          selectedHostStatus.isHttps = false
        }

        if (this.hostsDisabledCache.includes(data.host)) {
          selectedHostStatus.disableCache = true
        } else {
          selectedHostStatus.disableCache = false
        }

        if (this.filterKeyword && !node.label.includes(this.filterKeyword)) {
          node.visible = false
        } else {
          node.visible = true
        }

        selectedHostStatus.host = data.host

        nodeConfig.on = {
          contextmenu: (e) => {
            e.preventDefault()

            this.selectedHostStatus = selectedHostStatus
            self.$refs.hostCtxMenu.open()
          }
        }
      } else if (node.isLeaf) {
        iconConfig.class = ['tree-node-icon', 'el-icon-document']
      }

      return h('div', nodeConfig, [
        h('i', iconConfig),
        h('div', {
          class: ['tree-node-label'],
          attrs: {
            title: node.label
          }
        }, node.label)
      ])
    }
  },
  components: {
    contextMenu,
    RecordDetail
  }
}
</script>
<style scoped>
.record-data-wrapper {
  flex: 1;
  display: flex;
}
.record-tree {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 12px;
}
.dividor {
  position: relative;
  width: 6px;
  height: 100%;
  background: transparent;
  cursor: col-resize;
}
.dividor::after {
  content: '';
  position: absolute;
  top: 0;
  left: 2px;
  bottom: 0;
  width: 2px;
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
<style>
.record-tree .record-tree-node {
  display: flex;
  align-items: center;
  line-height: 26px;
  color: #333;
  user-select: none;
}
.record-tree .record-tree-node .tree-node-label {
  flex: 1;
}
.record-tree .record-tree-node .tree-node-icon {
  font-size: 14px;
  margin-right: 4px;
}
.record-tree .record-tree-node .tree-node-icon.el-icon-link {
  color: rgb(103, 194, 58);
}
.record-tree .record-tree-node .tree-node-icon.el-icon-lock {
  color: #777;
}
.record-tree .record-tree-node .tree-node-icon.el-icon-lock:hover {
  color: rgb(103, 194, 58);
  font-weight: bold;
}
.record-tree .record-tree-node .tree-node-icon.el-icon-unlock {
  color: rgb(103, 194, 58);
}

.ctx-menu {
  min-width: auto;
}
.ctx-menu li.disabled, .ctx-menu li.disabled:focus, .ctx-menu li.disabled:hover {
    color: #818a91;
}
.ctx-menu li {
  position: relative;
  display: block;
  list-style: none;
  padding: 0px 18px;
  font-size: 12px;
  line-height: 24px;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
}
.ctx-menu li:focus, .ctx-menu li:hover {
  color: #2b2d2f;
  text-decoration: none;
  background-color: #f5f5f5;
}
.ctx-menu li.checked::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 9px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: rgb(103, 194, 58);
}
</style>
