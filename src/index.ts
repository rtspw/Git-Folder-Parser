'use strict'

import path = require('path');
import fs = require('fs');


function getHeads(gitPath: string): {[key: string]: string} {
  const headsPath: string = path.join(gitPath, 'refs', 'heads');
  const headNames: Array<string> = fs.readdirSync(headsPath);
  const heads: {[key: string]: string} = {};
  headNames.forEach(headName => {
    const headPath = path.join(headsPath, headName);
    const hash = fs.readFileSync(headPath, 'utf-8').trim();
    heads[headName] = hash;
  });
  return heads;
}

function getTags(gitPath: string): {[key: string]: string} {
  const tagsPath: string = path.join(gitPath, 'refs', 'tags');
  const tagNames: Array<string> = fs.readdirSync(tagsPath);
  const tags: {[key: string]: string} = {};
  tagNames.forEach(tagName => {
    const tagPath = path.join(tagsPath, tagName);
    const hash = fs.readFileSync(tagPath, 'utf-8').trim();
    tags[tagName] = hash;
  });
  return tags;
}

interface GitData {
  heads: object,
  tags: object,
}

function parseGitFolder(gitFolderAbsolutePath?: string): GitData | null {
  const gitFolderPath: string = (() => {
    if (gitFolderAbsolutePath == null)
      return path.resolve(process.cwd(), '.git');
    return gitFolderAbsolutePath;
  })();
  if (!fs.existsSync(gitFolderPath)) {
    return null;
  }
  return {
    heads:getHeads(gitFolderPath), 
    tags:getTags(gitFolderPath),
  };
}

console.log(parseGitFolder())