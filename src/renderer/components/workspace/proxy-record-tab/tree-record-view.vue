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
    recordTreeData: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data: function () {
    return {
      isCursorMove: false,
      treeContainerWidth: 240,
      expendedKeys: [],
      selectedRecordId: -1
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
    enableHttps4Host (host) {
      this.$proxyApi.enableHttps4Host(host)
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
      let iconClass = ['tree-node-icon', 'el-icon-folder-opened']
      if (node.level === 1) {
        if (node.label.startsWith('https')) {
          if (this.hostsWithHttps.includes(`${node.label}:443`)) {
            iconClass = ['tree-node-icon', 'el-icon-unlock']
          } else {
            iconClass = ['tree-node-icon', 'el-icon-lock']
          }
        } else {
          iconClass = ['tree-node-icon', 'el-icon-link']
        }
        if (this.filterKeyword && !node.label.includes(this.filterKeyword)) {
          node.visible = false
        } else {
          node.visible = true
        }
      } else if (node.isLeaf) {
        iconClass = ['tree-node-icon', 'el-icon-document']
      }

      return h('div', {
        class: ['record-tree-node']
      }, [
        h('i', {
          class: iconClass
        }),
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
.record-tree .record-tree-node .tree-node-icon.el-icon-unlock {
  color: rgb(103, 194, 58);
}
</style>
