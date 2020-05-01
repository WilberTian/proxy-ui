<template>
  <div class="section-data-wrapper">
    <div class="section-title" v-if="title">
      {{title}}
    </div>
    <div v-if="isResponseImg" class="section-data" v-html="formatedBody"></div>
    <div v-else class="section-data preview-mode">{{formatedBody}}</div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String
    },
    url: {
      type: String
    },
    headerData: {
      type: Object
    },
    bodyData: {
      type: [Object, String]
    }
  },
  data: function () {
    return {
      isResponseImg: false
    }
  },
  computed: {
    formatedBody () {
      const contentType = this.headerData && (this.headerData['content-type'] || this.headerData['Content-Type'])

      if (this.bodyData) {
        if (contentType && contentType.match('image')) {
          this.isResponseImg = true
          return `<img style="width: 100%;" src="${this.url}">`
        } else if (contentType && contentType.match('json')) {
          this.isResponseImg = false
          try {
            let JSONObj = this.bodyData
            if (typeof this.bodyData === 'string') {
              JSONObj = JSON.parse(this.bodyData)
            }
            return JSON.stringify(JSONObj, null, 4)
          } catch (e) {
            return this.bodyData
          }
        } else {
          this.isResponseImg = false
          return this.bodyData
        }
      }
      return ''
    }
  }
}
</script>
<style scoped>
.section-data-wrapper {
  margin-bottom: 32px;
  padding: 0 8px;
}
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
}

.preview-mode {
  white-space: pre-wrap;
  background-color: aliceblue;
  padding: 12px;
  font-size: 12px;
  opacity: .8;
  color: #333;
  word-wrap: break-word;
  word-break: break-all;
}
</style>
