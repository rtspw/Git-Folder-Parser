'use strict'

const path = require('path')
const fs = require('fs')

const GitPath = require('./git-path')
const GitFileReader = require('./git-file-reader')
const GitFileParser = require('./git-file-parser')

function getHeads(gitPath) {
  const headNames = fs.readdirSync(gitPath.refs.heads)
  const heads = {}
  headNames.forEach(headName => {
      const headPath = gitPath.getHeadRefPath(headName)
      const hash = GitFileReader.readRefSync(headPath)
      heads[headName] = hash
  })
  return heads
}

class GitFolderParser {
  constructor(gitFolderAbsolutePath) {
    const gitFolderPath = (() => {
      if (gitFolderAbsolutePath == null) 
        return path.resolve(process.cwd(), '.git')
      return gitFolderAbsolutePath
    })()
    this.gitPath = new GitPath(gitFolderPath)
    this.heads = getHeads(this.gitPath)
  }

  getCommitDataFromHash(commitHash) {
    const commitPath = this.gitPath.getObjectPath(commitHash)
    const commitText = GitFileReader.readCommitBlobSync(commitPath)
    const commit = GitFileParser.parseCommit(commitText)
    return commit
  }

  parse() {
    const visitedCommits = new Set()
    const commitQueue = []
    const commits = {}
  
    for (const headName in this.heads) {
      const headHash = this.heads[headName]
      const commit = this.getCommitDataFromHash(headHash)
      commits[headHash] = commit
      visitedCommits.add(headHash)
      commitQueue.push(...commit.parents)
    }
  
    while (commitQueue.length > 0) {
      const frontCommitHash = commitQueue.shift()
      const commit = this.getCommitDataFromHash(frontCommitHash)
      commits[frontCommitHash] = commit
      visitedCommits.add(frontCommitHash)
      commitQueue.push(...commit.parents)
    }

    return commits
  }
}

console.log((new GitFolderParser()).parse())

module.exports = GitFolderParser
