<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import windowMixin from './window-mixin'

export default {
  name: 'proxy-ui',
  beforeCreate () {
    if (!window.localStorage.getItem('displayMode')) {
      window.localStorage.setItem('displayMode', 'group')
    }
  },
  mixins: [windowMixin]
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
  color: #333;
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
.el-tabs .el-tabs__header {
  margin: 0 !important;
  user-select: none;
}
.el-tabs__content {
  padding: 0 !important;
  height: calc(100% - 40px) !important;
}
.el-tabs__content .el-tab-pane {
  height: 100%;
}
.el-tabs__item:focus.is-active.is-focus:not(:active) {
  box-shadow: none !important;
}
.el-collapse-item__content {
  padding-bottom: 0 !important;
}
.el-pagination--small .el-select.el-select--mini {
  height: 22px;
  line-height: 22px;
}
.el-pagination--small .el-select.el-select--mini input {
  height: 22px;
  line-height: 22px;
}
.el-pagination--small .el-select.el-select--mini i {
  height: 22px;
  line-height: 22px;
}
.el-radio-button:focus:not(.is-focus):not(:active):not(.is-disabled) {
  box-shadow: none !important;
}
.el-radio:focus:not(.is-focus):not(:active):not(.is-disabled) .el-radio__inner {
  box-shadow: none !important;
}
textarea {
  border-radius: 0 !important;
}
</style>
