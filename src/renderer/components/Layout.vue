<template>
  <div class="workspace-container">
    <workspace-header />
    <workspace />
    <workspace-footer v-if="workspaceFooterVisible" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import WorkspaceHeader from './workspace-header'
import WorkspaceFooter from './workspace-footer'
import Workspace from './workspace'

export default {
  computed: {
    ...mapGetters({
      workspaceFooterVisible: 'getWorkspaceFooterVisible'
    })
  },
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
