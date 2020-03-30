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

function zip<V>(keys: Array<any>, values: Array<any>): {[key: string]: V} {
  const out: {[key: string]: V} = {};
  for (let i = 0; i < keys.length; i++) {
    out[String(keys[i])] = values[i];
  }
  return out;
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

async function getHeads(gitFolderPath: string): Promise<{[key: string]: string}> {
  const headDirPath: string = path.join(gitFolderPath, 'refs', 'heads');
  const headNames: Array<string> = await new Promise((resolve, reject) => {
    fs.readdir(headDirPath, (err, files) => err ? reject(err) : resolve(files));
  });
  const heads: {[key: string]: string} = {};
  const willBeHeadHashes: Array<Promise<string>> = headNames.map(headName => 
    new Promise((resolve, reject) => {
      const headPath: string = path.join(headDirPath, headName);
      fs.readFile(headPath, 'utf-8', (err, data) => {
        err ? reject(err) : resolve(data.trim());
      })
    })
  );
  await Promise.all(willBeHeadHashes).then(hashes => {
    hashes.forEach((hash, index) => heads[headNames[index]] = hash);
  })
  return heads;
}

async function getTags(gitFolderPath: string): Promise<{[key: string]: string}> {
  const tagDirPath: string = path.join(gitFolderPath, 'refs', 'tags');
  const tagNames: Array<string> = await new Promise((resolve, reject) => {
    fs.readdir(tagDirPath, (err, files) => err ? reject(err) : resolve(files));
  });
  const tags: {[key: string]: string} = {};
  const willBeTagHashes: Array<Promise<string>> = tagNames.map(tagName => 
    new Promise((resolve, reject) => {
      const tagPath: string = path.join(tagDirPath, tagName);
      fs.readFile(tagPath, 'utf-8', (err, data) => {
        err ? reject(err) : resolve(data.trim());
      })
    })
  );
  await Promise.all(willBeTagHashes).then(hashes => {
    hashes.forEach((hash, index) => tags[tagNames[index]] = hash);
  })
  return tags;
}

async function readCommitBlob(commitHashPath: string): Promise<string> {
  const commitBlob: Buffer = await new Promise((resolve, reject) => {
    fs.readFile(commitHashPath, (err, data) => err ? reject(err) : resolve(data));
  });
  return new Promise((resolve, reject) => {
    zlib.inflate(commitBlob, (err, data) => err ? reject(err) : resolve(data.toString()));
  });
}

async function getCommitDataFromHash(gitFolderPath: string, commitHash: string): Promise<CommitData> {
  const commitPath: string = path.join(
    gitFolderPath, 'objects', commitHash.substring(0, 2), commitHash.substring(2)
  );
  const commitText: string = await readCommitBlob(commitPath);
  const commit: CommitData = parseCommit(commitText);
  return commit;
}

async function getCommitList(gitFolderPath: string, heads: {[key: string]: string}): Promise<{[key: string]: CommitData}> {
  const visitedCommits: Set<string> = new Set();
  const commitQueue: Array<string> = [];
  const commits: {[key: string]: CommitData} = {};
  const headNames: Array<string> = Object.keys(heads);
  const headHashes: Array<string> = Object.values(heads);
  const willBeCommitDataList: Array<Promise<CommitData>> = headNames.map(headName => {
    const headHash: string = heads[headName];
    return getCommitDataFromHash(gitFolderPath, headHash);
  });
  await Promise.all(willBeCommitDataList).then(commitDataList => {
    commitDataList.forEach((commitData, index) => {
      commits[headHashes[index]] = commitData;
      visitedCommits.add(headHashes[index]);
      commitQueue.push(...commitData.parents);
    });
  });
  while (commitQueue.length > 0) {
    const frontCommitHash: string | undefined = commitQueue.shift();
    if (visitedCommits.has(frontCommitHash!)) continue;
    const commit: CommitData = await getCommitDataFromHash(gitFolderPath, frontCommitHash!);
    commits[frontCommitHash!] = commit;
    visitedCommits.add(frontCommitHash!);
    commitQueue.push(...commit.parents);
  }
  return commits;
}

async function getPackfileNames(gitFolderPath: string): Promise<Array<string>> {
  const packfileDirPath: string = path.join(gitFolderPath, 'objects', 'pack');
  const packfileNames: Array<string> = await new Promise((resolve, reject) => {
    fs.readdir(packfileDirPath, (err, filenames) => {
      if (err) reject(err);
      const cleanedFilenames: Array<string> = filenames
        .filter(filename => filename.includes('.pack'))
        .map(filename => filename.slice(0, -5));
      resolve(cleanedFilenames);
    });
  });
  return packfileNames;
}

async function parseIndexFile(gitFolderPath: string, packfileName: string): Promise<{[key: string]: string}> {
  return new Promise((resolve, reject) => {
    const indexFilePath: string = path.join(gitFolderPath, 'objects', 'pack', packfileName + '.idx');
    const rawDataStream: fs.ReadStream = fs.createReadStream(indexFilePath);
    const version2Signature: Buffer = Buffer.from([0xff, 0x74, 0x4f, 0x63]);

    rawDataStream.on('readable', () => {
      if (!rawDataStream.read(4).equals(version2Signature)) {
        reject(new Error('Packfile index signature does not match.'));
      }

      /* First layer: Number of objects with hash prefix 0x00, 0x01, ..., 0xff
       * The number is in a non-decreasing, or "cumulative" list */
      const cumulativeObjectCounts: Array<number> = [];
      for (let i = 0; i <= 256; i++) {
        cumulativeObjectCounts.push((rawDataStream.read(4).readUInt32BE()));
      }
      let runningTotal: number = 0;
      const objectCounts: Array<number> = cumulativeObjectCounts.map(cumulativeObjCount => {
        const adjustedCount: number = cumulativeObjCount - runningTotal;
        runningTotal = cumulativeObjCount;
        return adjustedCount;
      });
      const totalNumOfObjects = runningTotal;

      /* Second layer: Object hashes are 20 byte hex strings */
      let objectHashes: Array<Array<string>> = objectCounts.map(numOfObjectsForPrefix => {
        return range(0, numOfObjectsForPrefix).map(_ => {
          const hashSuffix = rawDataStream.read(20).toString('hex');
          return hashSuffix;
        })
      })

      /* Third layer: 4 byte checksums for each object. Currently ignored. */
      rawDataStream.read(totalNumOfObjects * 4);

      /* Fourth layer: Packfile offsets are 4 bytes when the msb is 0x0
       *  If msb = 0x1, the 4 byte number is an offset from the fifth layer
       *  which contains the packfile offset in a 8 byte number */
      const fifthLayerOffsets: {[key: string]: number} = {};
      const packfileOffsets: Array<Array<number>> = objectCounts.map((numOfObjectsForPrefix, prefix) => {
        return range(0, numOfObjectsForPrefix).map((_, suffixIndex) => {
          const offset = rawDataStream.read(4).readUInt32BE();
          const msb = offset & (0x1 << 31);
          if (msb) {
            const correspondingHash = objectHashes[prefix][suffixIndex];
            const offsetWhereMSBIsZero = offset & (((0x1 << 31) >> 30) >>> 1);
            fifthLayerOffsets[correspondingHash] = offsetWhereMSBIsZero;
            return null;
          }
          return offset;
        })
      });

      /* The offsets and hashes are turned into strings to remove typing issues
       * from number and bigInt */
      const offsetToHashMap: {[key: string]: string} = zip(packfileOffsets.flat(), objectHashes.flat());

      /* Fifth Layer: Remaining 8-byte offsets from fourth layer
       * This layer only matters if the offsets exceed 2^32 numerically */
      const remainingData: Buffer = rawDataStream.read();
      Object.entries(fifthLayerOffsets).forEach(([hash, offset]) => {
        const stringOffset = String(remainingData.readBigInt64BE(offset));
        offsetToHashMap[stringOffset] = hash;
      });

      resolve(offsetToHashMap);
      rawDataStream.destroy();
    });

    rawDataStream.on('error', error => {
      reject(error);
    });
  });
}

async function parsePackfile(gitFolderPath: string, packfileName: string): Promise<void> {
  const packfilePath: string = path.join(gitFolderPath, 'objects', 'pack', packfileName + '.pack');
  const packfileOffsets: {[key: string]: string} = await parseIndexFile(gitFolderPath, packfileName);
  const rawData: Buffer = fs.readFileSync(packfilePath);
  console.log(packfileOffsets);
  return;
}

async function parseGitFolder(gitFolderAbsolutePath?: string): Promise<GitProjectData | null> {
  const gitFolderPath: string = (() => {
    if (gitFolderAbsolutePath == null)
      return path.resolve(process.cwd(), '.git');
    return gitFolderAbsolutePath;
  })();

  if (!fs.existsSync(gitFolderPath)) {
    return null;
  }

  const packfileNames: Array<string> = await getPackfileNames(gitFolderPath);
  for (const packfileName of packfileNames) {
    await parsePackfile(gitFolderPath, packfileName);
  }

  const heads = await getHeads(gitFolderPath);
  const tags = await getTags(gitFolderPath);
  const commits = await getCommitList(gitFolderPath, heads);
  return {
    heads,
    tags,
    commits,
  };
}

parseGitFolder()

export = parseGitFolder;