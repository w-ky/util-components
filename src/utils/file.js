/*
* @param { file } file 源文件
* @description 读取图片文件为base64文件格式
* @return 返回base64文件
*/
export const readFile = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const data = e.target.result
      resolve(data)
    }
    reader.onerror = () => {
      const err = new Error('读取文件失败')
      reject(err.message)
    }
    reader.readAsDataURL(file)
  })
}


/*
* @description 判断是否是IE浏览器
* @return void
*/
export const isIE = () => {
  const uA = window.navigator.userAgent
  return /msie\s|trident\/|edge\//i.test(uA) && !!(
    'uniqueID' in document ||
    'documentMode' in document ||
    'ActiveXObject' in window ||
    'MSInputMethodContext' in window
  )
}

/*
* @param { object } res blob数据下载的响应头
* @description 文件流转化为url链接
* @return void
*/
export function transformStreamToUrl (res = {}) {
  // Blob数据对象
  const blob = new Blob([res.data])
  return window.URL.createObjectURL(blob)
}

/*
* @param { object } res blob数据下载的响应头
* @description 下载blob数据，通过url下载不兼容ie 需要通过blob数据流兼容ie浏览器
* @return void
*/
export function downloadBlobData (res, fileName='') {
  // 文件名
  fileName = fileName || decodeURIComponent(res?.headers['content-disposition'].split('fileName')[1])
  // Blob数据对象
  const blob = new Blob([res.data])

  // 兼容IE
  if (isIE()) {
    navigator.msSaveBlob(blob, fileName)
    return
  }

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  window.URL.removeObjectURL(link.href)
  link.remove()
}


/*
* @description file转base64
* @return void
*/
export const blobToDataURL = (blob, cb) => {
  const reader = new FileReader()
  reader.onload = function (evt) {
    const base64 = evt.target.result
    cb(base64)
  }
  reader.readAsDataURL(blob)
}

















