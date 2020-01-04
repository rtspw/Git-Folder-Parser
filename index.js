'use strict'

const path = require('path')
const fs = require('fs')
const zlib = require('zlib')

const GitPath = require('./git-path')
const GitFileReader = require('./git-file-reader')

const parse = gitFolderAbsolutePath => {
  const gitFolderPath = (() => {
    if (gitFolderAbsolutePath == null) 
      return path.resolve(process.cwd(), '.git')
    return gitFolderAbsolutePath
  })()
  const gitPath = new GitPath(gitFolderPath)

  const headNames = fs.readdirSync(gitPath.refs.heads)
  const headMap = {}
  headNames.forEach(headName => {
      const headPath = gitPath.getHeadRefPath(headName)
      const hash = GitFileReader.readRefSync(headPath)
      headMap[headName] = hash
  })

  for (const headName in headMap) {
    const a = GitFileReader.readCommitBlobSync(gitPath.getObjectPath(headMap[headName]))
    console.log(a)
  }
}


parse(path.resolve(__dirname, '../Advent\ Calendar\ 2019/.git'))

module.exports = { parse }
