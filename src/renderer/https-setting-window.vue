<template>
  <div id="https-setting-window">
    <https-setting />
  </div>
</template>

<script>
import windowMixin from './window-mixin'
import HttpsSetting from './components/https-setting/https-setting.vue'

export default {
  name: 'https-setting-window',
  mixins: [windowMixin],
  components: {
    HttpsSetting
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
#https-setting-window {
  height: 100vh;
}
</style>
