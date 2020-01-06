'use strict'

const expect = require('expect.js')
const GitFileParser = require('../git-file-parser')

const testData = require('./git-file-parser-mock')


describe('parseCommit', function() {
  it('should correctly parse the string into a commit object', function() {
    const result = GitFileParser.parseCommit(testData.completeSingleParent.input)
    expect(result).to.eql(testData.completeSingleParent.output)
  })

  it('should correctly parse when there are multiple parents', function() {
    const result = GitFileParser.parseCommit(testData.completeMultipleParents.input)
    expect(result).to.eql(testData.completeMultipleParents.output)
  })

  it('should correctly parse the root commit which has no parents', function() {
    const result = GitFileParser.parseCommit(testData.completeNoParents.input)
    expect(result).to.eql(testData.completeNoParents.output)
  })
})