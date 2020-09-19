const state = {
  ruleConfigs: {},
  proxyConfig: {},
  ruleEditMode: false,
  weinreServerStatus: 0,
  recordCount: 0,
  proxyServerStatus: false,
  proxyServerData: {
    hittedRuleCount: 0,
    proxyServerLogCount: 0,
    recordedRequestCount: 0
  }
}

window.state = state

const getters = {
  getRuleConfigs (state) {
    return state.ruleConfigs
  },
  getProxyConfig (state) {
    return state.proxyConfig
  },
  getRuleEditMode (state) {
    return state.ruleEditMode
  },
  getWeinreServerStatus (state) {
    return state.weinreServerStatus
  },
  getRecordCount (state) {
    return state.recordCount
  },
  getProxyServerStatus (state) {
    return state.proxyServerStatus
  },
  getProxyServerData (state) {
    return state.proxyServerData
  }
}

const mutations = {
  setRuleConfigs (state, ruleConfigs) {
    state.ruleConfigs = ruleConfigs
  },
  setProxyConfig (state, proxyConfig) {
    state.proxyConfig = proxyConfig
  },
  setRuleEditMode (state, ruleEditMode) {
    state.ruleEditMode = ruleEditMode
  },
  setWeinreServerStatus (state, status) {
    state.weinreServerStatus = status
  },
  setRecordCount (state, count) {
    state.recordCount = count
  },
  setProxyServerStatus (state, status) {
    state.proxyServerStatus = status
  },
  updateProxyServerData (state, proxyServerData) {
    state.proxyServerData = {
      ...state.proxyServerData,
      ...proxyServerData
    }
  }
}

export default {
  state,
  mutations,
  getters
}
