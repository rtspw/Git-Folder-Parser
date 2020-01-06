'use strict'

module.exports = {
  completeNoParents: {
    input: `commit 308\u0000tree ac2fd29b02e45afdfffde46dff0de0d11dd4abff
author rtspw <richard.cx.tang@gmail.com> 1577834797 -0800
committer Super Panama World <superpanamaworld@gmail.com> 1577834899 -0800

Added build script for extracting files to docs folder and README
`,
    output: {
      tree: 'ac2fd29b02e45afdfffde46dff0de0d11dd4abff',
      parents: [],
      author: { username: 'rtspw', email: '<richard.cx.tang@gmail.com>' },
      authorDate: new Date(1577834797 * 1000),
      authorTimezone: '-0800',
      committer: { username: 'Super Panama World', email: '<superpanamaworld@gmail.com>' },
      committerDate: new Date(1577834899 * 1000),
      committerTimezone: '-0800',
      message: 'Added build script for extracting files to docs folder and README',   
    },
  },
  completeSingleParent: {
    input: `commit 308\u0000tree ac2fd29b02e45afdfffde46dff0de0d11dd4abff
parent 7c520341c258896091e9e012f7cb8e50e4355122
author rtspw <richard.cx.tang@gmail.com> 1577834797 -0800
committer Super Panama World <superpanamaworld@gmail.com> 1577834899 -0800

Added build script for extracting files to docs folder and README
`,
    output: {
      tree: 'ac2fd29b02e45afdfffde46dff0de0d11dd4abff',
      parents: [ '7c520341c258896091e9e012f7cb8e50e4355122' ],
      author: { username: 'rtspw', email: '<richard.cx.tang@gmail.com>' },
      authorDate: new Date(1577834797 * 1000),
      authorTimezone: '-0800',
      committer: { username: 'Super Panama World', email: '<superpanamaworld@gmail.com>' },
      committerDate: new Date(1577834899 * 1000),
      committerTimezone: '-0800',
      message: 'Added build script for extracting files to docs folder and README',   
    },
  },
  completeMultipleParents: {
    input: `commit 308\u0000tree ac2fd29b02e45afdfffde46dff0de0d11dd4abff
parent 7c520341c258896091e9e012f7cb8e50e4355122
parent 7c520341c258896091e9e012f7cb8e50e4355123
parent 7c520341c258896091e9e012f7cb8e50e4355124
parent 7c520341c258896091e9e012f7cb8e50e4355125
parent 7c520341c258896091e9e012f7cb8e50e4355126
author rtspw <richard.cx.tang@gmail.com> 1577834797 -0800
committer Super Panama World <superpanamaworld@gmail.com> 1577834899 -0800

Added build script for extracting files to docs folder and README
`,
    output: {
      tree: 'ac2fd29b02e45afdfffde46dff0de0d11dd4abff',
      parents:
       [ '7c520341c258896091e9e012f7cb8e50e4355122',
         '7c520341c258896091e9e012f7cb8e50e4355123',
         '7c520341c258896091e9e012f7cb8e50e4355124',
         '7c520341c258896091e9e012f7cb8e50e4355125',
         '7c520341c258896091e9e012f7cb8e50e4355126' ],
      author: { username: 'rtspw', email: '<richard.cx.tang@gmail.com>' },
      authorDate: new Date(1577834797 * 1000),
      authorTimezone: '-0800',
      committer: { username: 'Super Panama World', email: '<superpanamaworld@gmail.com>' },
      committerDate: new Date(1577834899 * 1000),
      committerTimezone: '-0800',
      message: 'Added build script for extracting files to docs folder and README',   
    },
  },
}