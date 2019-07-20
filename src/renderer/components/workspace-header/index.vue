<template>
  <div class="workspace-header" @dblclick="handleDbClick">
    <div class="logo">
      Proxy UI
    </div>
    <window-btn-group />
  </div>
</template>

<script>
import WindowBtnGroup from './window-btn-group'

export default {
  methods: {
    handleDbClick () {
      this.$ipcRenderer.send('window-maximize')
    }
  },
  components: {
    WindowBtnGroup
  }
}
</script>

<style scoped>
.workspace-header {
  display: flex;
  align-items: center;
  height: 48px;
  line-height: 48px;
  background: #3f51b5;
  -webkit-app-region: drag;
}
.workspace-header .logo {
  flex: 1;
  color: #fff;
  font-weight: bold;
  padding: 0 12px;
  user-select: none;
}
.window-btn-group {
  margin: 0 12px;
}
</style>
