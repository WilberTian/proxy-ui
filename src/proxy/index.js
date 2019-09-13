import proxyManager from './proxy-manager'
import weinreManager from './weinre-manager'
import vconsoleManager from './vconsole-manager'

global.vconsoleConfig = vconsoleManager.readVconsoleConfig()
global.weinreProcess = null

export default {
  ...proxyManager,
  ...weinreManager,
  ...vconsoleManager
}
