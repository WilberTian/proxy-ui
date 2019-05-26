<template>
  <div class="workspace-footer">
    <div class="step-item" v-if="currentStep === 1">
      <div class="step-info">
        代理拦截规则配置
      </div>
      <div class="operation-btn" @click="gotoProxyConfig">
        下一步
      </div>
    </div>
    <div class="step-item" v-if="currentStep === 2">
      <div class="step-info">
        代理服务器配置
      </div>
      <div class="operation-btn" @click="gotoRuleConfig">
        返回代理规则配置
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters({
      currentStep: 'getCurrentStep'
    })
  },
  methods: {
    gotoProxyConfig () {
      this.$store.commit('setCurrentStep', 2)
    },
    gotoRuleConfig () {
      this.$store.commit('setCurrentStep', 1)
    }
  }
}
</script>

<style scoped>
.workspace-footer {
  height: 40px;
  line-height: 40px;
  background-color: #d7d7d7;
}
.step-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
}
.step-info {
  font-size: 14px;
  font-weight: bold;
}
.operation-btn {
  height: 26px;
  line-height: 26px;
  padding: 2px 12px;
  background: #409eff;
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}
</style>
