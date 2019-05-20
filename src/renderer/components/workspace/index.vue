<template>
  <div class="workspace">
    <rule-config v-show="selectedMenuId === 1" />
    <network  v-show="selectedMenuId === 2" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import RuleConfig from './rule-config'
import Network from './network'

export default {
  computed: {
    ...mapGetters({
      selectedMenuId: 'getSelectedMenuId'
    })
  },
  components: {
    RuleConfig,
    Network
  }
}
</script>

<style scoped>
</style>
