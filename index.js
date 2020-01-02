'use strict'

const fs = require('fs')
const path = require('path')

class GitPath {
  constructor(basePath) {
    this.basePath = basePath
    this.refs = {
      heads: path.join(basePath, 'heads'),
      remotes: path.join(basePath, 'remotes'),
      tags: path.join(basePath, 'tags'),
    }
    this.objects = {
      pack: path.join(basePath, 'objects', 'pack'),
      info: path.join(basePath, 'objects', 'info'),
    }
  }

  getObjectPath(hash) {
    return path.join(this.basePath, 'objects', hash.substring(0, 2), hash.substring(2))
  }
}

const parse = gitFolderAbsolutePath => {
  const gitFolderPath = (() => {
    if (gitFolderAbsolutePath == null) 
      return path.resolve(process.cwd(), '.git')
    return gitFolderAbsolutePath
  })()
  const gitPath = new GitPath(gitFolderPath)
  console.log(gitPath.getObjectPath('abcdefg'))
}

parse(path.resolve(__dirname, '../Advent\ Calendar\ 2019/.git'))


module.exports = { parse }
