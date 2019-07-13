<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'proxy-ui',
  mounted () {
    this.disableDragEvent()
  },
  methods: {
    disableDragEvent () {
      window.addEventListener('dragenter', this.disableDrag, false)
      window.addEventListener('dragover', this.disableDrag)
      window.addEventListener('drop', this.disableDrag)
    },
    disableDrag (e) {
      e.preventDefault()
      e.dataTransfer.effectAllowed = 'none'
      e.dataTransfer.dropEffect = 'none'
    }
  },
  beforeDestroy () {
    window.removeEventListener('dragenter', this.disableDrag, false)
    window.removeEventListener('dragover', this.disableDrag)
    window.removeEventListener('drop', this.disableDrag)
  }
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB,
    Microsoft YaHei, SimSun, sans-serif;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
}
#app {
  height: 100vh;
}
.el-dialog.is-fullscreen {
  display: flex;
  flex-direction: column;
}
.fullscreen-dialog .el-dialog__footer {
  padding: 10px !important;
}
.fullscreen-dialog .el-dialog__body {
  padding: 0 10px !important;
  flex: 1;
  overflow: auto;
}
.import-dialog .el-dialog__body .el-textarea {
  height: 100%;
}
.import-dialog .el-dialog__body .el-textarea textarea {
  height: 100%;
}
.CodeMirror {
  font-size: 13px;
  line-height: 20px;
}
.CodeMirror-cursor {
  height: 20px;
}
::-webkit-scrollbar {
  width: 0;
}
</style>
