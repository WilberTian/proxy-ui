import Vue from 'vue'

const state = {
  currentStep: 1,
  ruleConfigs: {},
  proxyConfig: {},
  proxyServerStatus: 0,
  workspaceFooterVisible: true,
  weinreServerStatus: 0,
  ruleConfigListDisplayMode: 'group'
}

window.state = state

const getters = {
  getCurrentStep (state) {
    return state.currentStep
  },
  getRuleConfigs (state) {
    return state.ruleConfigs
  },
  getProxyConfig (state) {
    return state.proxyConfig
  },
  getProxyServerStatus (state) {
    return state.proxyServerStatus
  },
  getWorkspaceFooterVisible (state) {
    return state.workspaceFooterVisible
  },
  getWeinreServerStatus (state) {
    return state.weinreServerStatus
  },
  getRuleConfigListDisplayMode (state) {
    return state.ruleConfigListDisplayMode
  }
}

const mutations = {
  setCurrentStep (state, currentStep) {
    state.currentStep = currentStep
  },
  setRuleConfigs (state, ruleConfigs) {
    state.ruleConfigs = ruleConfigs
  },
  addRuleConfig (state, ruleConfig) {
    state.ruleConfigs.push(ruleConfig)
  },
  deleteRuleConfig (state, guid) {
    state.ruleConfigs = state.ruleConfigs.filter((ruleConfig) => {
      return ruleConfig.guid !== guid
    })
  },
  cloneRuleConfig (state, ruleConfig) {
    state.ruleConfigs.push(ruleConfig)
  },
  updateRuleConfig (state, ruleConfigData) {
    const foundIdx = state.ruleConfigs.findIndex((ruleConfig) => {
      return ruleConfig.guid === ruleConfigData.guid
    })
    if (foundIdx > -1) {
      Vue.set(state.ruleConfigs, foundIdx, ruleConfigData)
    }
  },
  setProxyConfig (state, proxyConfig) {
    state.proxyConfig = proxyConfig
  },
  setProxyServerStatus (state, status) {
    state.proxyServerStatus = status
  },
  setWorkspaceFooterVisible (state, workspaceFooterVisible) {
    state.workspaceFooterVisible = workspaceFooterVisible
  },
  setWeinreServerStatus (state, status) {
    state.weinreServerStatus = status
  },
  setRuleConfigListDisplayMode (state, ruleConfigListDisplayMode) {
    state.ruleConfigListDisplayMode = ruleConfigListDisplayMode
  }
}

export default {
  state,
  mutations,
  getters
}
