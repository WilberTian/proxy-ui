<template>
  <div class="workspace-sidebar">
    <div class="menu-item" v-for="menu in menuList" :key="menu.id" @click="setSelectedMenuId(menu.id)">
      {{menu.label}}
    </div>
  </div>
</template>

<script>
import {menus} from '@/configs/ui'

export default {
  beforeCreate () {
    this.menuList = menus
  },
  methods: {
    setSelectedMenuId (id) {
      this.$store.commit('setSelectedMenuId', id)
    }
  }
}
</script>

<style scoped>
.workspace-sidebar {
  background-color: #d7d7d7;
}
.workspace-sidebar .menu-item {
  height: 32px;
  line-height: 32px;
  padding: 4px;
  cursor: pointer;
}
</style>
