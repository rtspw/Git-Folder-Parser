'use strict'

const fs = require('fs')
const zlib = require('zlib')

const GitFileReader = {

  readRefSync(refPath) {
    return fs.readFileSync(refPath, 'utf-8').trim()
  },

  readCommitBlobSync(commitHashPath) {
    const commitBlob = fs.readFileSync(commitHashPath)  
    return zlib.inflateSync(commitBlob).toString()
  },

}

module.exports = GitFileReader
