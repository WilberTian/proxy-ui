import Vue from 'vue'

const state = {
  selectedMenuId: 1,
  ruleConfigs: {},
  proxyConfig: {},
  proxyServerStatus: 0
}

window.state = state

const getters = {
  getSelectedMenuId (state) {
    return state.selectedMenuId
  },
  getRuleConfigs (state) {
    return state.ruleConfigs
  },
  getProxyConfig (state) {
    return state.proxyConfig
  },
  getProxyServerStatus (state) {
    return state.proxyServerStatus
  }
}

const mutations = {
  setSelectedMenuId (state, selectedMenuId) {
    state.selectedMenuId = selectedMenuId
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
  }
}

export default {
  state,
  mutations,
  getters
}
