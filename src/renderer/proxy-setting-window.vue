<template>
  <div id="proxy-setting-window">
    <proxy-setting />
  </div>
</template>

<script>
import windowMixin from './window-mixin'
import ProxySetting from './components/proxy-setting/proxy-setting.vue'

export default {
  name: 'proxy-setting-window',
  mixins: [windowMixin],
  components: {
    ProxySetting
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
#proxy-setting-window {
  height: 100vh;
}
</style>
