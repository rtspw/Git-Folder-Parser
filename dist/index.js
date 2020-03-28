'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
function getHeads(gitPath) {
    var headsPath = path.join(gitPath, 'refs', 'heads');
    var headNames = fs.readdirSync(headsPath);
    var heads = {};
    headNames.forEach(function (headName) {
        var headPath = path.join(headsPath, headName);
        var hash = fs.readFileSync(headPath, 'utf-8').trim();
        heads[headName] = hash;
    });
    return heads;
}
function getTags(gitPath) {
    var tagsPath = path.join(gitPath, 'refs', 'tags');
    var tagNames = fs.readdirSync(tagsPath);
    var tags = {};
    tagNames.forEach(function (tagName) {
        var tagPath = path.join(tagsPath, tagName);
        var hash = fs.readFileSync(tagPath, 'utf-8').trim();
        tags[tagName] = hash;
    });
    return tags;
}
function parseGitFolder(gitFolderAbsolutePath) {
    var gitFolderPath = (function () {
        if (gitFolderAbsolutePath == null)
            return path.resolve(process.cwd(), '.git');
        return gitFolderAbsolutePath;
    })();
    if (!fs.existsSync(gitFolderPath)) {
        return null;
    }
    return {
        heads: getHeads(gitFolderPath),
        tags: getTags(gitFolderPath),
    };
}
console.log(parseGitFolder());
