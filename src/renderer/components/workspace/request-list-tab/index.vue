<template>
  <div v-if="requestList.length > 0" class="request-list-tab">
    <div
      class="request-list"
      :style="{ width: `${requestListContainerWidth}px` }"
    >
      <div
        :class="{ 'request-item': true, selected: selectedRequestIdx === idx }"
        v-for="(request, idx) in requestList"
        :key="idx"
        @click="selectRequest(idx)"
      >
        <div class="request-method">
          {{ request.method }}
        </div>
        <div class="request-url">
          {{ request.protocol }}://{{ request.host }}{{ request.path }}
        </div>
      </div>
    </div>
    <div
      :class="{ dividor: true, active: isCursorMove }"
      @mousedown.stop.prevent="handleCursorDown"
    ></div>
    <div class="request-item-detail" v-loading="loading">
      <div class="btn-wrapper" v-if="selectedRequestIdx !== -1">
        <el-button
          type="success"
          size="mini"
          @click="processRequest"
          v-if="requestIdxInEdit !== selectedRequestIdx"
          >发送请求</el-button
        >
        <el-button
          type="primary"
          size="mini"
          @click="editRequestData"
          v-if="requestIdxInEdit !== selectedRequestIdx"
          >修改请求</el-button
        >
        <el-button
          type="primary"
          size="mini"
          @click="saveRequestData"
          v-if="requestIdxInEdit === selectedRequestIdx"
          >保存</el-button
        >
        <el-button
          type="primary"
          size="mini"
          @click="cancelEditRequestData"
          v-if="requestIdxInEdit === selectedRequestIdx"
          >取消</el-button
        >
        <el-button type="danger" size="mini" @click="removeRequest"
          >删除请求</el-button
        >
        <div class="info-btn">
          <el-popover placement="left" width="300" trigger="hover">
            <div>
              <div>
                <b>默认行为：</b>
              </div>
              <div :style="{ margin: '4px 8px' }">
                1. 代理开启时，请求经过代理服务器<br />
                2. 代理关闭时，请求不经过代理服务器
              </div>
              <br />
              <div>
                <b>覆盖默认设置：</b>
              </div>
              <div :style="{ margin: '4px 8px' }">
                <el-checkbox
                  :value="
                    typeof selectedRequest.withProxy === 'undefined'
                      ? proxyServerStatus
                      : selectedRequest.withProxy
                  "
                  @change="
                    value => {
                      updateWithProxy(value, idx)
                    }
                  "
                >
                  请求通过代理服务器
                </el-checkbox>
              </div>
            </div>
            <i class="el-icon-info" slot="reference"></i>
          </el-popover>
        </div>
      </div>
      <el-tabs v-model="activeTabName" v-if="selectedRequestIdx !== -1" class="request-detail-tab">
        <el-tab-pane label="请求数据" name="request">
          <div
            class="request-detail-reader"
            v-if="requestIdxInEdit !== selectedRequestIdx"
          >
            <kv-viewer
              title="请求头"
              :kvData="selectedRequest.reqHeader || {}"
            />
            <http-body-viewer
              title="请求体"
              :bodyData="{
                isRequest: true,
                headers: selectedRequest.reqHeader,
                body: selectedRequest.reqBody
              }"
            />
          </div>
          <div class="request-detail-editor" v-else>
            <div class="header">
              请求头
            </div>
            <http-header-editor
              :httpHeader="selectedRequest.reqHeader || {}"
              @change="updateRequestHeader"
            />
            <div class="header">
              请求体
            </div>
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 10 }"
              :value="selectedRequest.reqBody || ''"
              @input="updateRequestBody"
            ></el-input>
          </div>
        </el-tab-pane>
        <el-tab-pane label="响应数据" name="response">
          <div v-if="responseOfSelectedRequest && (typeof responseOfSelectedRequest === 'object')">
            <kv-viewer
              title="响应头"
              :kvData="responseOfSelectedRequest.headers || {}"
            />
            <http-body-viewer
              title="响应体"
              :bodyData="{
                url: `${selectedRequest.protocol}://${selectedRequest.host}${
                  selectedRequest.path
                }`,
                isRequest: false,
                headers: responseOfSelectedRequest.headers,
                body: responseOfSelectedRequest.data
              }"
            />
          </div>
          <div v-else style="padding: 20px;">
            <div v-if="typeof responseOfSelectedRequest === 'string'">
              {{responseOfSelectedRequest}}
            </div>
            <div v-else>
              没有数据
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div class="empty-request-list-msg" v-if="selectedRequestIdx === -1">
        没有选中请求
      </div>
    </div>
  </div>
  <div v-else>
    当前没有录制的请求！
  </div>
</template>
<script>
import events from '@/configs/events'
import eventBus from '@/utils/event-bus'
import KvViewer from '@/components/workspace/common/kv-viewer'
import HttpBodyViewer from '@/components/workspace/common/http-body-viewer'
import showNotification from '@/utils/show-notification'
import HttpHeaderEditor from '@/components/common/http-header-editor'

export default {
  props: {
    proxyServerStatus: {
      type: Boolean
    }
  },
  data: function() {
    return {
      isCursorMove: false,
      requestListContainerWidth: 320,
      requestList: [],
      selectedRequestIdx: -1,
      selectedRequest: null,
      requestIdxInEdit: -1,
      loading: false,
      responseOfSelectedRequest: null,
      activeTabName: 'request'
    }
  },
  created() {
    this.mouseOffX = 0
  },
  mounted() {
    this.requestList = this.$proxyApi.readRequestList()
    this.updateRequestListCount()
    eventBus.$on(events.ADD_REQUEST, this.addRequest)
    eventBus.$on(events.REMOVE_REQUEST, this.removeRequest)
  },
  beforeDestroy() {
    eventBus.$off(events.ADD_REQUEST, this.addRequest)
    eventBus.$off(events.REMOVE_REQUEST, this.removeRequest)
  },
  methods: {
    handleCursorDown(e) {
      this.isCursorMove = true
      this.mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft
      this.lastMouseX = this.mouseX
      document.documentElement.addEventListener(
        'mousemove',
        this.handleCursorMove,
        true
      )
      document.documentElement.addEventListener(
        'mouseup',
        this.handleCursorUp,
        true
      )
    },
    handleCursorMove(e) {
      this.mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft
      let diffX = this.mouseX - this.lastMouseX
      this.mouseOffX = 0

      this.lastMouseX = this.mouseX
      if (this.isCursorMove) {
        if (
          this.requestListContainerWidth + diffX >= 100 &&
          this.requestListContainerWidth + diffX <= 600
        ) {
          this.requestListContainerWidth += diffX
        }
      }
    },
    handleCursorUp() {
      this.isCursorMove = false
      document.documentElement.removeEventListener(
        'mousemove',
        this.handleCursorMove,
        true
      )
      document.documentElement.removeEventListener(
        'mouseup',
        this.handleCursorUp,
        true
      )
    },
    selectRequest(idx) {
      this.requestIdxInEdit = -1
      this.responseOfSelectedRequest = null

      this.activeTabName = 'request'
      this.selectedRequestIdx = idx
      this.selectedRequest = JSON.parse(JSON.stringify(this.requestList[idx]))
    },
    addRequest(requestInfo) {
      this.requestList.push(requestInfo)
      this.updateRequestListCount()
      this.$proxyApi.writeRequestList(this.formatRequestList())
      showNotification(
        '提示',
        {
          body: '请求录制成功',
          tag: 'simple-notification'
        },
        4000
      )
    },
    removeRequest() {
      this.$confirm('确认删除该记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.requestList.splice(this.selectRequest, 1)
          this.updateRequestListCount()
          this.$proxyApi.writeRequestList(this.formatRequestList())
          this.selectedRequestIdx = -1
          this.selectedRequest = null
          this.requestIdxInEdit = -1
        })
        .catch(() => {
          //
        })
    },
    updateRequestListCount() {
      this.$store.commit('updateProxyServerData', {
        recordedRequestCount: this.requestList.length
      })
    },
    formatRequestList() {
      const requestList = []
      this.requestList.forEach(item => {
        requestList.push({
          protocol: item.protocol,
          host: item.host,
          path: item.path,
          method: item.method,
          reqHeader: item.reqHeader,
          reqBody: item.reqBody
        })
      })
      return requestList
    },
    async processRequest() {
      const requestInfo = this.selectedRequest

      this.loading = true

      try {
        const proxyConfig = await this.$proxyApi.readProxyConfig()
        const withProxy =
          typeof requestInfo.withProxy === 'undefined'
            ? this.proxyServerStatus
            : requestInfo.withProxy
        const response = await this.$proxyApi.processRequest(
          requestInfo,
          proxyConfig,
          withProxy
        )

        this.loading = false
        this.responseOfSelectedRequest = {
          headers: response.headers,
          status: response.status,
          data: response.data
        }
      } catch (e) {
        this.loading = false
        this.responseOfSelectedRequest = e.message
      }
    },
    updateWithProxy(value, idx) {
      this.$set(this.requestList, idx, {
        ...this.requestList[idx],
        withProxy: value
      })
    },
    editRequestData() {
      this.requestIdxInEdit = this.selectedRequestIdx
    },
    saveRequestData() {
      if (this.requestIdxInEdit > -1) {
        this.requestList[this.requestIdxInEdit] = this.selectedRequest

        this.$proxyApi.writeRequestList(this.formatRequestList())

        this.requestIdxInEdit = -1
      }
    },
    cancelEditRequestData() {
      this.requestIdxInEdit = -1
      this.selectRequest(this.selectedRequestIdx)
    },
    updateRequestHeader(val) {
      this.selectedRequest.reqHeader = val
    },
    updateRequestBody(val) {
      this.selectedRequest.reqBody = val
    }
  },
  components: {
    KvViewer,
    HttpBodyViewer,
    HttpHeaderEditor
  }
}
</script>
<style lang="less" scoped>
.request-list-tab {
  display: flex;
  overflow: hidden;
  height: 100%;

  .request-list {
    .request-item {
      display: flex;
      border-bottom: 1px solid #d7d7d7;
      height: 54px;
      align-items: center;
      cursor: pointer;

      .request-method {
        line-height: 54px;
        min-width: 54px;
        text-align: center;
        font-weight: bold;
        background: #efefef;
      }
      .request-url {
        flex: 1;
        padding: 0 4px;
        font-size: 14px;
        line-height: 18px;
        word-break: break-all;
      }
    }
    .request-item.selected {
      border-right: 4px solid #3a8ee6;
      background: aliceblue;
    }
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
    background: #ddd;
  }
  .dividor.active::after {
    background: #3a8ee6;
  }
  .dividor:hover::after {
    background: #3a8ee6;
  }

  .request-item-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .btn-wrapper {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 8px;
      background: #efefef;

      .info-btn {
        margin: 0 12px;
      }
    }

    .request-detail-tab {
      flex: 1;
      overflow: hidden;

      .el-tabs__content {
        .request-detail-reader {
          margin-bottom: 20px;
        }
        .request-detail-editor {
          padding: 8px;
          .header {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            border-bottom: 1px solid #efefef;
            padding: 8px 4px;
            margin-bottom: 8px;
          }
        }
      }
    }
  }

  .empty-request-list-msg {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    color: #999;
  }
}
</style>
<style lang="less">
.request-detail-tab {
  > .el-tabs__content {
    padding: 0 !important;
    height: calc(100% - 40px) !important;

    .el-tab-pane {
      height: 100%;
      overflow: auto;
    }
  }
}
</style>
