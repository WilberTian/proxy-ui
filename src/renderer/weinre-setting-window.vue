<template>
  <div id="weinre-setting-window">
    <weinre-setting />
  </div>
</template>

<script>
import windowMixin from './window-mixin'
import WeinreSetting from './components/weinre-setting/weinre-setting.vue'

export default {
  name: 'weinre-setting-window',
  mixins: [windowMixin],
  components: {
    WeinreSetting
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
#weinre-setting-window {
  height: 100vh;
}
</style>
