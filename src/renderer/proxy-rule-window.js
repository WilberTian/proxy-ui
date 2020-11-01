import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueSVGIcon from 'vue-svgicon'

import store from './store'
import './filters/rule-type-convertor'
import ProxyRuleWindow from './proxy-rule-window.vue'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(VueSVGIcon)
Vue.use({
  install (Vue, options) {
    Vue.prototype.$proxyApi = global.proxyApi
    Vue.prototype.$dialog = global.dialog
    Vue.prototype.$ipcRenderer = global.ipcRenderer
    Vue.prototype.$gDataStore = global.gDataStore
  }
})

/* eslint-disable no-new */
new Vue({
  store,
  components: { ProxyRuleWindow },
  template: '<ProxyRuleWindow />'
}).$mount('#app')
