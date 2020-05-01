<template>
  <div class="workspace">
    <rule-config v-show="currentStep === 1" />
    <proxy-config  v-show="currentStep === 2" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import RuleConfig from './rule-config'
import ProxyConfig from './proxy-config'
import Network from './network'

export default {
  computed: {
    ...mapGetters({
      currentStep: 'getCurrentStep'
    })
  },
  components: {
    RuleConfig,
    ProxyConfig,
    Network
  }
}
</script>

<style scoped>
.workspace {
  display: flex;
}
</style>
