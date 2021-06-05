<template>
  <div class="section-data-wrapper">
    <div class="section-title" v-if="title">
      {{ title }}
    </div>
    <div v-if="showRawHTML" class="section-data" v-html="formatedBody"></div>
    <div v-else class="section-data preview-mode">
      <truncate
        action-class="truncate-btn"
        clamp="显示更多"
        :length="1000"
        less="收起更多"
        :text="formatedBody || '没有数据'"
      ></truncate>
    </div>
  </div>
</template>
<script>
import truncate from 'vue-truncate-collapsed'

export default {
  props: {
    title: {
      type: String
    },
    bodyData: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data: function() {
    return {
      showRawHTML: false
    }
  },
  computed: {
    formatedBody() {
      const contentType =
        this.bodyData.headers &&
        (this.bodyData.headers['content-type'] ||
          this.bodyData.headers['Content-Type'])
      if (this.bodyData.body) {
        if (contentType && contentType.match('image')) {
          this.showRawHTML = true
          return `<img style="width: 100%;" alt="${this.bodyData.url}" src="${
            this.bodyData.url
          }">`
        } else if (contentType && /json|text|javascript/.test(contentType)) {
          this.showRawHTML = false
          try {
            let JSONObj = this.bodyData.body
            if (typeof this.bodyData.body === 'string') {
              JSONObj = JSON.parse(this.bodyData.body)
            }
            return JSON.stringify(JSONObj, null, 4)
          } catch (e) {
            return this.bodyData.body
          }
        } else if (contentType && !this.bodyData.isRequest) {
          this.showRawHTML = true
          return `<a href="${this.bodyData.url}">${this.bodyData.url}</a>`
        } else {
          this.showRawHTML = false
          return this.bodyData.body
        }
      }
      return ''
    }
  },
  components: {
    truncate
  }
}
</script>
<style lang="less" scoped>
.section-data-wrapper {
  margin-bottom: 32px;
  padding: 0 8px;

  .section-title {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    border-bottom: 1px solid #efefef;
    padding: 8px 4px;
    margin-bottom: 8px;
  }
  .section-data {
    margin: 0 4px;
    padding: 12px;
    background-color: #efefef;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 12px;
  }
  .preview-mode {
    opacity: 0.8;
    color: #333;
  }
}
</style>
<style>
.truncate-btn {
  color: #409eff;
  font-weight: bold;
  display: block;
  text-align: right;
}
</style>
