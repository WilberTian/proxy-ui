<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'proxy-ui'
  }
</script>

<style>
  html, body {
    margin: 0;
    padding: 0;
  }
  #app {
    height: 100vh;
  }
</style>
