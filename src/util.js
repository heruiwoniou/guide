
function When2do (condition, option = { times: 10 }) {
  this.o = {
    condition: condition,
    times: option.times
  }
  this.r = {
    error: 0,
    t: null
  }
  var that = this
  return new Promise(function (resolve, reject) {
    that.r.t = setTimeout(function wheel () {
      if (that.o.condition()) {
        clearTimeout(that.r.t)
        that.r.t = null
        resolve()
      } else if (that.r.error++ > that.o.times) {
        reject(new Error('Did not meet the conditions'))
      } else {
        that.r.t = setTimeout(wheel, 500)
      }
    })
  })
}

export const when = (condition, option) => new When2do(condition, option)

export const location = (el) => {
  let result = {
    x: el.offsetLeft,
    y: el.offsetTop
  }
  while ((el = el.offsetParent)) {
    result.x += el.offsetLeft
    result.y += el.offsetTop
  }
  return result
}
