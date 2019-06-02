<template>
  <div class="workspace-footer">
    <div
      class="step-item"
      v-if="currentStep === 1"
    >
      <div class="step-info">
        代理拦截规则配置
      </div>
      <el-popover
        ref="advanceSettingPopover"
        placement="top"
        v-model="advanceSettingVisible"
        trigger="click"
      >
        <div class="advance-setting-item">导出规则配置</div>
        <div class="advance-setting-item">导入规则配置</div>
        <div class="advance-setting-item">重置规则配置</div>
      </el-popover>
      <div
        class="advance-setting-btn"
        v-popover:advanceSettingPopover
      >
        高级
      </div>
      <div
        class="create-rule-config-btn"
        @click="createRuleConfig"
      >
        <i class="el-icon-circle-plus-outline"></i>
        添加规则
      </div>
      <div
        class="operation-btn"
        @click="gotoProxyConfig"
      >
        下一步
      </div>
    </div>
    <div
      class="step-item"
      v-if="currentStep === 2"
    >
      <div class="step-info">
        代理服务器配置
      </div>
      <div
        class="operation-btn"
        @click="gotoRuleConfig"
      >
        返回代理规则配置
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import events from '@/configs/events'
import eventBus from '@/utils/event-bus'

export default {
  data () {
    return {
      advanceSettingVisible: false
    }
  },
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
    },
    createRuleConfig () {
      eventBus.$emit(events.CREATE_RULE_CONFIG)
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
  align-items: center;
  padding: 0 12px;
}
.step-info {
  font-size: 14px;
  font-weight: bold;
  flex: 1;
}
.create-rule-config-btn,
.operation-btn,
.advance-setting-btn {
  height: 26px;
  line-height: 26px;
  padding: 2px 12px;
  margin: 0 8px;
  background: #409eff;
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}
.advance-setting-btn {
  height: 22px;
  line-height: 22px;
  color: #333;
  border: 2px solid #999;
  background: transparent;
}
.advance-setting-item {
  height: 26px;
  line-height: 26px;
  padding: 4px 10px;
  margin: 8px;
  background: #409eff;
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  user-select: none;
}
</style>
