<template>
  <div class="workspace-container">
    <workspace-header />
    <workspace />
    <workspace-footer />
  </div>
</template>

<script>
import WorkspaceHeader from './workspace-header'
import Workspace from './workspace'
import WorkspaceFooter from './workspace-footer'

export default {
  components: {
    WorkspaceHeader,
    Workspace,
    WorkspaceFooter
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
