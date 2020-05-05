<template>
  <div class="request-list-tab">
    <div class="data-wrapper" v-if="requestList.length > 0">
      <div class="requesst-item-wrapper" v-for="(request, idx) in requestList" :key="idx" :name="idx"> 
          <div class="request-item">
            <div v-loading="request.loading" class="btn-wrapper" @click="processRequest(idx)">
              {{request.method}}
            </div>
            <div class="request-url" @click="toggleVisible(idx)">
              {{request.protocol}}://{{request.host}}{{request.path}}
            </div>
            <div class="detail-btn" @click="toggleVisible(idx)">
              {{request.visible ? '收起详情' : '展开详情'}}
            </div>
            <div class="info-btn">
              <el-popover
                placement="left"
                width="300"
                trigger="hover"
              >
                <div>
                  <div>
                    <b>默认行为：</b>
                  </div>
                  <div :style="{margin: '4px 8px'}">
                    1. 代理开启时，请求经过代理服务器<br/>
                    2. 代理关闭时，请求不经过代理服务器
                  </div>
                  <br/>
                  <div>
                    <b>覆盖默认设置：</b>
                  </div>
                  <div :style="{margin: '4px 8px'}">
                    <el-checkbox
                      :value="typeof request.withProxy === 'undefined' ? proxyServerStatus === 1 : request.withProxy"
                      @change="(value) => {updateWithProxy(value, idx)}"
                    >
                      请求通过代理服务器
                    </el-checkbox>
                  </div>
                </div>
                <i class="el-icon-info" slot="reference"></i>
              </el-popover>
            </div>
            <div class="delete-btn" @click="removeRequest(idx)">
              <i class="el-icon-error"></i>
            </div>
          </div>
          <div v-if="request.visible" class="request-item-detail">
            <el-tabs>
              <el-tab-pane label="响应数据">
                <div v-if="request.response">
                  <kv-viewer title="响应头" :kvData="request.response.headers || {}" />
                  <http-body-viewer title="响应体" :bodyData="{
                    isRequest: false,
                    headers: request.response.headers,
                    body: request.response && request.response.data
                  }" />
                </div>
                <div v-else style="padding: 20px;">
                  没有数据
                </div>
              </el-tab-pane>
              <el-tab-pane label="请求数据">
                <kv-viewer title="请求头" :kvData="request.reqHeader || {}" />
                <http-body-viewer title="请求体" :bodyData="{
                  isRequest: true,
                  headers: request.reqHeader,
                  body: request.reqBody && request.reqBody.data
                }" />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
    </div>
    <div
      class="empty-request-list-msg"
      v-if="requestList.length === 0"
    >
      当前没有录制的请求！
    </div>
  </div>
</template>
<script>
import events from '@/configs/events'
import eventBus from '@/utils/event-bus'
import KvViewer from '@/components/workspace/common/kv-viewer'
import HttpBodyViewer from '@/components/workspace/common/http-body-viewer'

export default {
  props: {
    proxyServerStatus: {
      type: Number
    }
  },
  data () {
    return {
      requestList: []
    }
  },
  mounted () {
    this.requestList = this.$proxyApi.readRequestList()
    this.updateRequestListCount()
    eventBus.$on(events.ADD_REQUEST, this.addRequest)
    eventBus.$on(events.REMOVE_REQUEST, this.removeRequest)
  },
  beforeDestroy () {
    eventBus.$off(events.ADD_REQUEST, this.addRequest)
    eventBus.$off(events.REMOVE_REQUEST, this.removeRequest)
  },
  methods: {
    addRequest (requestInfo) {
      this.requestList.push(requestInfo)
      this.updateRequestListCount()
      this.$proxyApi.writeRequestList(this.formatRequestList())
      this.$notify({
        title: '提示',
        message: '请求录制成功',
        type: 'success'
      })
    },
    removeRequest (idx) {
      this.$confirm('确认删除该记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.requestList.splice(idx, 1)
          this.updateRequestListCount()
          this.$proxyApi.writeRequestList(this.formatRequestList())
        })
        .catch(() => {
          //
        })
    },
    updateRequestListCount () {
      this.$store.commit('updateProxyServerData', {
        recordedRequestCount: this.requestList.length
      })
    },
    toggleVisible (idx) {
      this.$set(this.requestList, idx, {
        ...this.requestList[idx],
        visible: !this.requestList[idx].visible
      })
    },
    formatRequestList () {
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
    async processRequest (idx) {
      const requestInfo = this.requestList[idx]

      this.$set(this.requestList, idx, {
        ...requestInfo,
        loading: true,
        response: null
      })
      try {
        const proxyConfig = await this.$proxyApi.readProxyConfig()
        const withProxy = typeof requestInfo.withProxy === 'undefined' ? this.proxyServerStatus === 1 : requestInfo.withProxy
        const response = await this.$proxyApi.processRequest(requestInfo, proxyConfig, withProxy)

        this.$set(this.requestList, idx, {
          ...requestInfo,
          loading: false,
          visible: true,
          response: {
            headers: response.headers,
            status: response.status,
            data: response.data
          }
        })
      } catch (e) {
        this.$set(this.requestList, idx, {
          ...requestInfo,
          loading: false,
          visible: true,
          response: {
            headers: null,
            status: 0,
            data: e.message
          }
        })
      }
    },
    updateWithProxy (value, idx) {
      this.$set(this.requestList, idx, {
        ...this.requestList[idx],
        withProxy: value
      })
    }
  },
  components: {
    KvViewer,
    HttpBodyViewer
  }
}
</script>
<style scoped>
.request-list-tab {
  height: 100%;
}
.request-list-tab .data-wrapper {
  height: 100%;
  overflow-y: auto;
}
.requesst-item-wrapper {
  margin: 8px;
  border: 1px solid #bbb;
  border-radius: 4px;
  overflow: hidden;
}
.requesst-item-wrapper .request-item {
  display: flex;
  align-items: center;
  height: 30px;
  line-height: 30px;
  font-size: 12px;
}
.requesst-item-wrapper .request-item .btn-wrapper {
  width: 48px;
  font-size: 10px;
  text-align: center;
  margin-right: 8px;
  background-color: #409eff;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
}
.requesst-item-wrapper .request-item .request-url {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
}
.requesst-item-wrapper .request-item .detail-btn {
  color: #409eff;
  cursor: pointer;
  padding: 0 8px;
  height: 16px;
  line-height: 16px;
  border-right: 1px solid #ccc;
}
.requesst-item-wrapper .request-item .delete-btn {
  font-size: 14px;
  cursor: pointer;
  margin: 0 8px 0 0;
}
.requesst-item-wrapper .request-item .info-btn {
  font-size: 14px;
  cursor: pointer;
  margin: 0 8px;
}
.requesst-item-wrapper .request-item-detail {
  font-size: 12px;
  border-top: 1px solid #efefef;
  padding: 0 4px;
}
.request-list-tab .empty-request-list-msg {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #999;
}
</style>
