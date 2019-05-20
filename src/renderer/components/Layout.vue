<template>
  <div class="workspace-container">
    <workspace-sidebar />
    <div class="workspace-wrapper">
      <workspace-header />
      <workspace />
    </div>
  </div>
</template>

<script>
import WorkspaceHeader from './workspace-header'
import WorkspaceSidebar from './workspace-sidebar'
import Workspace from './workspace'

export default {
  components: {
    WorkspaceHeader,
    WorkspaceSidebar,
    Workspace
  }
}
</script>
<style scoped>
.workspace-container {
  width: 100%;
  height: 100%;
  display: flex;
}
.workspace-container .workspace-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.workspace-container .workspace-wrapper .workspace-header {
  border-bottom: 1px solid #333;
}
.workspace-container .workspace-wrapper .workspace {
  flex: 1;
}
</style>
