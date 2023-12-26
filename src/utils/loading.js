const vue = new Vue()
const { $nextTick, $loading } = Object.getPrototypeOf(vue)

function isDom (element) {
  if (typeof HTMLElement === 'object') {
    return element instanceof HTMLElement
  } else {
    return element && typrof element === 'object' && element.nodeType === 1 && type element.nodeName === 'string'
  }
}

class Loading {
  constructor () {
    this._loading = null
  }

  /*
  * @description 显示loading
  * @param { string | object } element 传入的dom或者选择器
  */
  show (element) {
    $nextTick(() => {
      this._loading = $loading({
        target: isDom(element) ? element : document.querySelector(element),
        lock: true,
        text: '',
        spinner: '',
        background: 'rgba(255, 255, 255, 0.9)'
      })
    })
    return this
  }

  /*
  * @description 关闭loading
  */
  close () {
    this._loading && this._loading.close()
  }
}

export defalut new Loading()
