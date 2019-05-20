<template>
  <div class="proxy-config">
    
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      proxyConfig: 'getProxyConfig'
    })
  },
  mounted () {
    const proxyConfig = this.$proxyApi.readProxyConfig()
    this.$store.commit('setProxyConfig', proxyConfig)
  }
}
</script>

<style scoped>
</style>
