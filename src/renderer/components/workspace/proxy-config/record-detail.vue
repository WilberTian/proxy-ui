<template>
  <div class="record-detail" v-loading="loading">
    <div class="close-icon">
      <i class="el-icon-error" @click="emitClose" />
    </div>
    <el-tabs class="record-detail-tab" v-model="selectedTab">
      <el-tab-pane label="请求数据" name="request">
        <div class="data-wrapper">
          <div class="data-section">
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
          <div class="data-section">
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
          <div class="data-section">
            <div class="section-title">
              Body
            </div>
            <div class="section-data">
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="响应数据" name="response">
        <div class="data-wrapper">
          <div class="data-section">
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
          <div class="data-section">
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
          <div class="data-section">
            <div class="section-title">
              Body
            </div>
            <div class="section-data preview-mode">{{responseBody && responseBody.content.toString()}}</div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
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
      responseBody: null
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
    }
  }
}
</script>

<style scoped>
.record-detail {
  position: fixed;
  top: 48px;
  right: 0;
  height: calc(100% - 48px);
  width: 68vw;
  background-color: #fff;
  box-shadow: -2px 0 2px #ccc;
  z-index: 999;
}

.close-icon {
  position: absolute;
  right: 8px;
  top: 6px;
  color: #409EFF;
  font-size: 24px;
  cursor: pointer;
  z-index: 1;
}

.record-detail-tab {
  width: 100%;
  height: 100%;
}

.data-wrapper {
  height: 100%;
  overflow-y: auto;
}
.data-section {
  margin-bottom: 32px;
  margin-left: 8px;
}
.section-title {
  font-size: 16px;
  font-weight: bold;  
  color: #333;
  border-left: 3px solid #409EFF;
  padding: 2px 4px;
  margin-bottom: 8px;
}
.section-data-item {
  display: flex;
  font-size: 12px;
  margin: 12px 8px;
  opacity: .8;
  color: #333;
}
.section-data-item .label {
  width: 120px;
  padding: 0 8px;
  font-weight: bold;
  word-wrap: break-word;
  word-break: break-all;
}
.section-data-item .value {
  flex: 1;
  padding: 0 8px;
  word-wrap: break-word;
  word-break: break-all;
  border-left: 1px solid #ccc;
}

.preview-mode {
  white-space: pre-wrap;
  background-color: aliceblue;
  padding: 12px;
  font-size: 12px;
  opacity: .8;
  color: #333;
}
</style>
