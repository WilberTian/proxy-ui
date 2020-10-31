<template>
  <div class="record-detail" v-loading="loading">
    <el-tabs class="record-detail-tab" v-model="selectedTab">
      <el-tab-pane label="请求数据" name="request">
        <div class="request-record-btn" v-if="['POST', 'PUT', 'GET', 'DELETE'].includes(recordDetail.method)">
          <el-button size="mini" type="primary" @click="resendRequestHandler">重发请求</el-button>
          <el-button size="mini" type="primary" @click="addRequestHandler">录制请求</el-button>
          <el-tooltip class="item" effect="dark" content="将请求信息记录下来，在“已录制请求”界面中，可以重新发送请求" placement="bottom">
            <i class="el-icon-info"></i>
          </el-tooltip>
        </div>
        <div class="data-wrapper">
          <kv-viewer title="通用" :kvData="{
            Method: recordDetail.method,
            Url: recordDetail.url
          }" />
          <kv-viewer title="请求头" :kvData="recordDetail.reqHeader || {}" />
          <http-body-viewer title="请求体" :bodyData="{
            url: recordDetail.url,
            isRequest: true,
            headers: recordDetail.reqHeader,
            body: recordDetail.reqBody
          }" />
        </div>
      </el-tab-pane>
      <el-tab-pane label="响应数据" name="response">
        <div class="data-wrapper">
          <kv-viewer title="通用" :kvData="{
            Status: recordDetail.statusCode
          }" />
          <kv-viewer title="响应头" :kvData="recordDetail.resHeader || {}" />
          <http-body-viewer title="响应体" :bodyData="{
            url: recordDetail.url,
            isRequest: false,
            headers: recordDetail.resHeader,
            body: responseBody && responseBody.content
          }" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import events from '@/configs/events'
import eventBus from '@/utils/event-bus'
import KvViewer from '@/components/workspace/common/kv-viewer'
import HttpBodyViewer from '@/components/workspace/common/http-body-viewer'

export default {
  props: {
    id: {
      type: Number
    }
  },
  data: function () {
    return {
      selectedTab: 'request',
      loading: true,
      recordDetail: {},
      responseBody: null,
      isResponseImg: false
    }
  },
  watch: {
    id (val) {
      this.loading = true
      this.getRecordDetail(val)
    }
  },
  mounted () {
    this.getRecordDetail(this.id)
  },
  methods: {
    getRecordDetail (recordId) {
      const self = this
      this.$proxyApi.getRecordById(recordId).then((record) => {
        self.recordDetail = record
        self.loading = false
      }, (err) => {
        self.loading = false
        self.$message.error(err.message)
      })
      this.$proxyApi.getRecordBody(recordId).then((body) => {
        self.responseBody = body
        self.loading = false
      }, () => {
        self.responseBody = ''
        self.loading = false
      })
    },
    addRequestHandler () {
      eventBus.$emit(events.ADD_REQUEST, {
        protocol: this.recordDetail.protocol,
        host: this.recordDetail.host,
        path: this.recordDetail.path,
        method: this.recordDetail.method,
        reqHeader: this.recordDetail.reqHeader,
        reqBody: this.recordDetail.reqBody
      })
    },
    async resendRequestHandler () {
      try {
        const proxyConfig = await this.$proxyApi.readProxyConfig()
        await this.$proxyApi.processRequest(this.recordDetail, proxyConfig, true)
      } catch (e) {
        alert(e.message)
      }
    }
  },
  components: {
    KvViewer,
    HttpBodyViewer
  }
}
</script>

<style scoped>
.record-detail, .record-detail-tab {
  height: 100%;
  width: 100%;
}
.request-record-btn {
  position: absolute;
  z-index: 100;
  top: 4px;
  right: 24px;
}
.data-wrapper {
  height: 100%;
  overflow-y: auto;
}
</style>
