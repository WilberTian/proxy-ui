const getDataFromLocalStorage = (windowInstance, key) => {
  return new Promise((resolve, reject) => {
    if (windowInstance) {
      windowInstance.webContents.executeJavaScript(`localStorage.getItem('${key}')`).then((value) => {
        resolve(value)
      }, () => {
        reject(new Error('读取localstorage失败'))
      })
    } else {
      reject(new Error('读取localstorage失败'))
    }
  })
}

const setDataForLocalStorage = (windowInstance, key, value) => {
  return new Promise((resolve, reject) => {
    if (windowInstance) {
      windowInstance.webContents.executeJavaScript(`localStorage.setItem('${key}', '${value}')`).then(() => {
        resolve()
      }, () => {
        reject(new Error('写入localstorage失败'))
      })
    } else {
      reject(new Error('写入localstorage失败'))
    }
  })
}

export {
  getDataFromLocalStorage,
  setDataForLocalStorage
}
