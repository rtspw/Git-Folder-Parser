'use strict'

const Util = require('./util')

function convertSecondsToMilliseconds(seconds) {
  return seconds * 1000
}

const GitFileParser = {

  parseCommit(commitText) {
    const numOfParents = commitText.match(/parent/g).length
    const lineTokens = commitText.split(/\n+|\u0000/)
    const allTokens = lineTokens.map(line => line.split(/\s/))
    const tree = allTokens[1][1]
    const parents = []
    Util.range(2, numOfParents).forEach(lineNum => {
      parents.push(allTokens[lineNum][1])
    })
    const authorLineNum = 2 + numOfParents
    const authorLine = allTokens[authorLineNum]
    const author = {
      username: authorLine.slice(1, -3).join(' '),
      email: authorLine[authorLine.length - 3],
    }
    const authorDate = new Date(convertSecondsToMilliseconds(authorLine[authorLine.length - 2]))
    const authorTimezone = authorLine[authorLine.length - 1]
    const committerLineNum = authorLineNum + 1
    const committerLine = allTokens[committerLineNum]
    const committer = {
      username: committerLine.slice(1, -3).join(' '),
      email: committerLine[committerLine.length - 3],
    }
    const committerDate = new Date(convertSecondsToMilliseconds(committerLine[committerLine.length - 2]))
    const committerTimezone = committerLine[committerLine.length - 1]
    const messageLineNum = committerLineNum + 1
    const message = lineTokens[messageLineNum]
    return {
      tree,
      parents,
      author,
      authorDate,
      authorTimezone,
      committer,
      committerDate,
      committerTimezone,
      message,
    }
  },

}

module.exports = GitFileParser
