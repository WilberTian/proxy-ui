import { Loading } from 'element-ui'

let loadingInstance

export function showLoading () {
  if (!loadingInstance) {
    loadingInstance = Loading.service({ fullscreen: true })
  }
}

export function closeLoading () {
  if (loadingInstance) {
    loadingInstance.close()
  }
}
