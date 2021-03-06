import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueSVGIcon from 'vue-svgicon'

import ProxySettingWindow from './proxy-setting-window.vue'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(VueSVGIcon)
Vue.use({
  install (Vue, options) {
    Vue.prototype.$proxyApi = global.proxyApi
    Vue.prototype.$ipcRenderer = global.ipcRenderer
  }
})

/* eslint-disable no-new */
new Vue({
  components: { ProxySettingWindow },
  template: '<ProxySettingWindow />'
}).$mount('#app')
