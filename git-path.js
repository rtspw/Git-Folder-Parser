'use strict'

const path = require('path')
const fs = require('fs')

class GitPath {
  constructor(basePath) {
    this.basePath = basePath
    this.refs = {
      heads: path.join(basePath, 'refs', 'heads'),
      remotes: path.join(basePath, 'refs', 'remotes'),
      tags: path.join(basePath, 'refs', 'tags'),
    }
    this.objects = {
      pack: path.join(basePath, 'objects', 'pack'),
      info: path.join(basePath, 'objects', 'info'),
    }
  }

  getObjectPath(hash) {
    return path.join(this.basePath, 'objects', hash.substring(0, 2), hash.substring(2))
  }

  getHeadRefPath(headName) {
    return path.join(this.refs.heads, headName)
  }

  getRemoteRefPath(remoteName) {
    return path.join(this.refs.remotes, remoteName)
  }

  getTagRefPath(tagName) {
    return path.join(this.refs.tags, tagName)
  }

  getAllObjectHashes({ asPaths } = { asPaths: false }) {
    const objectDirPath = path.join(this.basePath, 'objects')
    const objectPrefixDirs = fs.readdirSync(objectDirPath).filter(dirName => dirName.length === 2)
    const objectHashList = []
    objectPrefixDirs.forEach(prefix => {
      const objectHashes = fs.readdirSync(path.join(objectDirPath, prefix))
      objectHashes.forEach(objectHash => {
        const fullHash = prefix + objectHash
        if (asPaths) {
          objectHashList.push(this.getObjectPath(fullHash))
          return 
        }
        objectHashList.push(fullHash)
      })
    })
    return objectHashList
  }
}

module.exports = GitPath
