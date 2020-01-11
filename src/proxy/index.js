import proxyManager from './proxy-manager'
import weinreManager from './weinre-manager'
import vconsoleManager from './vconsole-manager'
import requestManager from './request-manager'

global.vconsoleConfig = vconsoleManager.readVconsoleConfig()
global.weinreProcess = null

export default {
  ...proxyManager,
  ...weinreManager,
  ...vconsoleManager,
  ...requestManager
}
