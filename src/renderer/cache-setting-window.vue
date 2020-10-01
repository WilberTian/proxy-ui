<template>
  <div id="cache-setting-window">
    <cache-setting />
  </div>
</template>

<script>
import windowMixin from './window-mixin'
import CacheSetting from './components/cache-setting/cache-setting.vue'

export default {
  name: 'cache-setting-window',
  mixins: [windowMixin],
  components: {
    CacheSetting
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
#cache-setting-window {
  height: 100vh;
}
</style>
