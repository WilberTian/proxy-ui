import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueSVGIcon from 'vue-svgicon'

import App from './App'
import router from './router'
import store from './store'
import './filters/rule-type-convertor'
import VueHighlightJS from 'vue-highlightjs'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(VueSVGIcon)
Vue.use(VueHighlightJS)
Vue.use({
  install (Vue, options) {
    Vue.prototype.$proxyApi = global.proxyApi
    Vue.prototype.$dialog = global.dialog
    Vue.prototype.$ipcRenderer = global.ipcRenderer
    Vue.prototype.$shell = global.shell
  }
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
