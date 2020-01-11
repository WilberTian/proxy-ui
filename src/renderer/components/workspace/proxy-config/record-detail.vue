<template>
  <div class="record-detail" v-loading="loading">
    <div class="close-icon">
      <i class="el-icon-error" @click="emitClose" />
    </div>
    <el-tabs class="record-detail-tab" v-model="selectedTab">
      <el-tab-pane label="请求数据" name="request">
        <div class="request-record-btn" v-if="['POST', 'PUT', 'GET', 'DELETE'].includes(recordDetail.method)">
          <el-button size="mini" type="primary" @click="addRequestHandler">录制请求</el-button>
          <el-tooltip class="item" effect="dark" content="" placement="bottom">
            <i class="el-icon-info"></i>
          </el-tooltip>
        </div>
        <div class="data-wrapper">
          <div class="section-data-wrapper">
            <div class="section-title">
              General
            </div>
            <div class="section-data">
              <div class="section-data-item">
                <div class="label">
                  Method
                </div>
                <div class="value">
                  {{recordDetail.method}}
                </div>
              </div>
              <div class="section-data-item">
                <div class="label">
                  Url
                </div>
                <div class="value">
                  {{recordDetail.url}}
                </div>
              </div>
            </div>
          </div>
          <div class="section-data-wrapper">
            <div class="section-title">
              Header
            </div>
            <div class="section-data">
              <div class="section-data-item" v-for="(value, key) in recordDetail.reqHeader" :key="key">
                <div class="label">
                  {{key}}
                </div>
                <div class="value">
                  {{value}}
                </div>
              </div>
            </div>
          </div>
          <div class="section-data-wrapper">
            <div class="section-title">
              Body
            </div>
            <div class="section-data preview-mode">{{recordDetail.reqBody}}</div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="响应数据" name="response">
        <div class="data-wrapper">
          <div class="section-data-wrapper">
            <div class="section-title">
              General
            </div>
            <div class="section-data">
              <div class="section-data-item">
                <div class="label">
                  Status
                </div>
                <div class="value">
                  {{recordDetail.statusCode}}
                </div>
              </div>
            </div>
          </div>
          <div class="section-data-wrapper">
            <div class="section-title">
              Header
            </div>
            <div class="section-data">
              <div class="section-data-item" v-for="(value, key) in recordDetail.resHeader" :key="key">
                <div class="label">
                  {{key}}
                </div>
                <div class="value">
                  {{value}}
                </div>
              </div>
            </div>
          </div>
          <div class="section-data-wrapper">
            <div class="section-title">
              Body
            </div>
            <div v-if="isResponseImg" class="section-data" v-html="formatedBody"></div>
            <div v-else class="section-data preview-mode">{{formatedBody}}</div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import events from '@/configs/events'
import eventBus from '@/utils/event-bus'

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
  computed: {
    formatedBody () {
      if (this.responseBody) {
        const type = this.responseBody.type
        if (type.match('image')) {
          this.isResponseImg = true
          return `<img style="width: 100%;" src="${this.recordDetail.url}">`
        } else {
          this.isResponseImg = false
          return this.responseBody.content
        }
      }
      return ''
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
    emitClose () {
      this.$emit('close')
    },
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
    }
  }
}
</script>

<style scoped>
.record-detail {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 68vw;
  background-color: #fff;
  z-index: 999;
}

.close-icon {
  position: absolute;
  right: 8px;
  top: 6px;
  color: #333;
  font-size: 24px;
  cursor: pointer;
  z-index: 1;
}

.record-detail-tab {
  width: 100%;
  height: 100%;
}
.request-record-btn {
  position: absolute;
  top: 2px;
  right: 24px;
}
.data-wrapper {
  height: 100%;
  overflow-y: auto;
}

.section-data-wrapper {
  margin-bottom: 32px;
  padding: 0 8px;
}
.section-title {
  font-size: 16px;
  font-weight: bold;  
  color: #333;
  border-bottom: 1px solid #ccc;
  padding: 8px 4px;
  margin-bottom: 8px;
}
.section-data {
  margin: 0 4px;
}
.section-data-item {
  display: flex;
  font-size: 13px;
  margin: 12px 8px;
  opacity: .8;
  color: #333;
}
.section-data-item .label {
  width: 120px;
  padding-right: 8px;
  font-weight: bold;
  word-wrap: break-word;
  word-break: break-all;
}
.section-data-item .value {
  flex: 1;
  padding-left: 8px;
  word-wrap: break-word;
  word-break: break-all;
  border-left: 1px solid #ccc;
}

.preview-mode {
  white-space: pre-wrap;
  background-color: aliceblue;
  padding: 12px;
  font-size: 13px;
  opacity: .8;
  color: #333;
  word-wrap: break-word;
  word-break: break-all;
}
</style>
