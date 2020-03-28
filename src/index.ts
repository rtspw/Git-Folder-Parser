'use strict'

import path = require('path');
import fs = require('fs');
import zlib = require('zlib');

interface UserData {
  username: string,
  email: string,
}

interface CommitData {
  tree: string,
  parents: Array<string>,
  author: UserData,
  authorDate: Date,
  authorTimezone: string,
  committer: UserData,
  committerDate: Date,
  committerTimezone: string,
  message: string,
}

interface GitProjectData {
  heads: object,
  tags: object,
  commits: {[key: string]: CommitData},
}

function range(start: number, length: number): Array<number> {
  return [...Array(length).keys()].map(i => i + start);
}

function parseCommit(commitText: string): CommitData {
  const parentMatches: Array<string> | null = commitText.match(/parent/g);
  const numOfParents: number = parentMatches ? parentMatches.length : 0;
  const lineTokens: Array<string> = commitText.split(/\n+|\u0000/);
  const allTokens: Array<Array<string>> = lineTokens.map(line => line.split(/\s/));
  const tree: string = allTokens[1][1];
  const parents: Array<string> = []
  range(2, numOfParents).forEach(lineNum => {
    parents.push(allTokens[lineNum][1]);
  });
  const authorLineNum: number = 2 + numOfParents;
  const committerLineNum: number = authorLineNum + 1;
  const messageLineNum: number = committerLineNum + 1;
  const authorLine: Array<string> = allTokens[authorLineNum];
  const committerLine: Array<string> = allTokens[committerLineNum];
  const message: string = lineTokens[messageLineNum];
  const author: UserData = {
    username: authorLine.slice(1, -3).join(' '),
    email: authorLine[authorLine.length - 3],
  };
  const authorDate: Date = new Date(Number(authorLine[authorLine.length - 2]) * 1000);
  const authorTimezone: string = authorLine[authorLine.length - 1];
  const committer: UserData = {
    username: committerLine.slice(1, -3).join(' '),
    email: committerLine[committerLine.length - 3],
  };
  const committerDate: Date = new Date(Number(committerLine[committerLine.length - 2]) * 1000);
  const committerTimezone: string = committerLine[committerLine.length - 1];
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
  };
}

function getHeads(gitFolderPath: string): {[key: string]: string} {
  const headDirPath: string = path.join(gitFolderPath, 'refs', 'heads');
  const headNames: Array<string> = fs.readdirSync(headDirPath);
  const heads: {[key: string]: string} = {};
  headNames.forEach(headName => {
    const headPath = path.join(headDirPath, headName);
    const hash = fs.readFileSync(headPath, 'utf-8').trim();
    heads[headName] = hash;
  });
  return heads;
}

function getTags(gitFolderPath: string): {[key: string]: string} {
  const tagDirPath: string = path.join(gitFolderPath, 'refs', 'tags');
  const tagNames: Array<string> = fs.readdirSync(tagDirPath);
  const tags: {[key: string]: string} = {};
  tagNames.forEach(tagName => {
    const tagPath = path.join(tagDirPath, tagName);
    const hash = fs.readFileSync(tagPath, 'utf-8').trim();
    tags[tagName] = hash;
  });
  return tags;
}

function readCommitBlobSync(commitHashPath: string): string {
  const commitBlob: Buffer = fs.readFileSync(commitHashPath);
  return zlib.inflateSync(commitBlob).toString();
}

function getCommitDataFromHash(gitFolderPath: string, commitHash: string): CommitData {
  const commitPath: string = path.join(
    gitFolderPath, 'objects', commitHash.substring(0, 2), commitHash.substring(2)
  );
  const commitText: string = readCommitBlobSync(commitPath);
  const commit: CommitData = parseCommit(commitText);
  return commit;
}

function getCommitList(gitFolderPath: string, heads: {[key: string]: string}): {[key: string]: CommitData} {
  const visitedCommits: Set<string> = new Set();
  const commitQueue: Array<string> = [];
  const commits: {[key: string]: CommitData} = {};
  for (const headName in heads) {
    const headHash: string = heads[headName];
    const commit: CommitData = getCommitDataFromHash(gitFolderPath, headHash);
    commits[headHash] = commit;
    visitedCommits.add(headHash);
    commitQueue.push(...commit.parents);
  }
  while (commitQueue.length > 0) {
    const frontCommitHash: string | undefined = commitQueue.shift();
    if (visitedCommits.has(frontCommitHash!)) continue;
    const commit: CommitData = getCommitDataFromHash(gitFolderPath, frontCommitHash!);
    commits[frontCommitHash!] = commit;
    visitedCommits.add(frontCommitHash!);
    commitQueue.push(...commit.parents);
  }
  return commits;
}

function parseGitFolder(gitFolderAbsolutePath?: string): GitProjectData | null {
  const gitFolderPath: string = (() => {
    if (gitFolderAbsolutePath == null)
      return path.resolve(process.cwd(), '.git');
    return gitFolderAbsolutePath;
  })();

  if (!fs.existsSync(gitFolderPath)) {
    return null;
  }

  const heads = getHeads(gitFolderPath);
  const tags = getTags(gitFolderPath);
  const commits = getCommitList(gitFolderPath, heads);
  return {
    heads,
    tags,
    commits,
  };
}

export = parseGitFolder;