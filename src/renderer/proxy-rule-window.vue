<template>
  <div id="proxy-rule-window">
    <proxy-rule-form />
  </div>
</template>

<script>
import windowMixin from './window-mixin'
import ProxyRuleForm from './components/proxy-rule-form/proxy-rule-form'

export default {
  name: 'proxy-rule-window',
  mixins: [windowMixin],
  components: {
    ProxyRuleForm
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
  color: #333;
}
#proxy-rule-window {
  height: 100vh;
}
.CodeMirror {
  font-size: 13px;
  line-height: 20px;
}
.CodeMirror-cursor {
  height: 20px;
}
.el-tabs__content {
  padding: 0 !important;
  height: calc(100% - 40px) !important;
}
</style>
