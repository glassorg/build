#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const [,,dir, argumentJSON] = process.argv

function getFilesRecursive(directory, pattern = /\btest\b.+\.js$/, rootDirectory = directory, allFiles = []) {
    for (let name of fs.readdirSync(directory)) {
        let filename = path.join(directory, name)
        let fileInfo = fs.statSync(filename)
        if (fileInfo.isFile()) {
            let relativeFilename = path.relative(rootDirectory, filename)
            if (pattern.test(relativeFilename)) {
                allFiles.push(relativeFilename)
            }
        }
        else {
            getFilesRecursive(filename, pattern, rootDirectory, allFiles)
        }
    }
    return allFiles
}

function test(directory) {
    let files = getFilesRecursive(directory)
    for (let file of files) {
        let relativePath = path.relative(__dirname, path.join(directory, file))
        require(relativePath)
    }
}

if (dir == null) {
    console.log(`\nUsage: gtest directory\n\n`)
    return 0
}
else {
    test(dir)
}
