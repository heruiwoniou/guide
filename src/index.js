import es6promise from 'es6-promise'
import { when, location } from './util'

es6promise.polyfill()

export default function Guide (queue, zIndex) {
  this.queue = queue
  this.zIndex = zIndex || 9999
  this.initHandler = () => this.init()
  this.initHandler()
}

Guide.prototype = {
  constructor: Guide,
  init () {
    var container, canvas

    canvas = this.canvas = document.createElement('canvas')
    container = document.createElement('div')
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.overflow = 'hidden'
    container.style.zIndex = this.zIndex
    container.style.position = 'relative'

    container.appendChild(canvas)
    document.body.appendChild(container)

    this.container = container

    this.ctx = this.canvas.getContext('2d')

    var requires = []

    this.queue.forEach(o => {
      requires.push(new Promise((resolve, reject) => {
        var img = new Image()
        img.onload = () => {
          o.img = img
          resolve()
        }
        img.src = o.src
      }))
    })

    Promise.all(requires).then(() => this.next())

    window.addEventListener('resize', () => {
      if (this.draw()) {
        setTimeout(() => this.drawItem(true), 200)
      }
    })
  },
  draw () {
    if (!this.beging) return false
    let canvas = this.canvas
    canvas.width = this.width = document.documentElement.offsetWidth
    canvas.height = this.height = document.documentElement.offsetHeight
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    this.ctx.fillRect(0, 0, this.width, this.height)
    try {
      canvas.removeEventListener('click', this.nextHandler)
    } catch (e) { }
    this.nextHandler = () => this.next()
    canvas.addEventListener('click', this.nextHandler)
    return true
  },
  drawItem (isresize) {
    if (this.doing || !this.option) return
    this.doing = true
    let option = this.option
    let handler = option.handler || function () { return { x: 0, y: 0 } }
    let src = option.src
    let selector = option.selector
    let ctx = this.ctx
    let delay = option.delay
    let repeat = option.repeat
    let before = option.before || function (done) { done() }

    when(() => document.querySelector(selector), { times: repeat }).then(() => {
      setTimeout(() => {
        let todo = () => {
          this.beging = true
          this.draw()
          var el = document.querySelector(selector)
          var img = new Image()
          img.addEventListener('load', () => {
            var offset = handler(el, img, option), loc = location(el), x = loc.x + offset.x, y = loc.y + offset.y
            ctx.clearRect(x, y, img.width, img.height)
            ctx.drawImage(img, x, y, img.width, img.height)
            img = null
            this.doing = false
          })
          img.src = src
        }
        before(todo)
      }, isresize ? 0 : delay)
    }, () => {
      this.doing = false
      this.next()
    })
  },
  next () {
    if (this.doing) return
    if (this.queue.length === 0) this.dispose()
    else {
      this.option = this.queue.shift()
      this.drawItem()
    }
  },

  dispose () {
    this.canvas = null
    this.ctx = null
    this.container.parentNode.removeChild(this.container)
    this.container = null
    this.beging = false
  }
}
