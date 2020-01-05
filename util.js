'use strict'

const Util = {
  range(start, length) {
    return [...Array(length).keys()].map(i => i + start)
  },
}

module.exports = Util
