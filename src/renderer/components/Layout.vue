<template>
  <div class="workspace-container">
    <workspace-header />
    <workspace />
  </div>
</template>

<script>
import WorkspaceHeader from './workspace-header'
import Workspace from './workspace'

export default {
  components: {
    WorkspaceHeader,
    Workspace
  }
}
</script>
<style scoped>
.workspace-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.workspace-container .workspace {
  flex: 1;
}
</style>
