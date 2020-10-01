<template>
  <div id="vconsole-setting-window">
    <vconsole-setting />
  </div>
</template>

<script>
import windowMixin from './window-mixin'
import VconsoleSetting from './components/vconsole-setting/vconsole-setting.vue'

export default {
  name: 'vconsole-setting-window',
  mixins: [windowMixin],
  components: {
    VconsoleSetting
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
#vconsole-setting-window {
  height: 100vh;
}
</style>
