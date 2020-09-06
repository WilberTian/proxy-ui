<template>
  <div id="proxy-rule-window">
    <proxy-rule-form />
  </div>
</template>

<script>
import ProxyRuleForm from './components/proxy-rule-form/proxy-rule-form'

export default {
  name: 'proxy-rule-window',
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
  },
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
</style>
