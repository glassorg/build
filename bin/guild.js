#!/usr/bin/env node
const path = require("path")
const common = require("../lib/common")
const [,,name, argumentJSON] = process.argv

//  add the local bin path to the environment variable PATH
//  so we can use installed programs with spawn and spawnSync
const localBinPath = path.join(__dirname, "../node_modules/.bin")
process.env.PATH = localBinPath + path.delimiter + process.env.PATH
//  also add the local node_modules path to the environment variable NODE_PATH
const localNodePath = path.join(__dirname, "../node_modules")
process.env.NODE_PATH = (process.env.NODE_PATH || "") + path.delimiter + localBinPath

if (name == null) {
    //  if they don't provide a command then we display usage and available commands
    console.log(`\nUsage: guild command [argument]\n\n    Commands:\n`)
    const fs = require("fs")
    //  read the source files in the commands directory
    let commands = fs.readdirSync(`${__dirname}/../src/commands`).sort().filter(name => !name.startsWith("_"))
    for (let filename of commands) {
        let source = fs.readFileSync(`${__dirname}/../src/commands/${filename}`, "utf8")
        //  parse out the comment and function signature to display
        let result = (/(\/\/\s+(.*))?\nexport\s+default\s+function\s+([a-z][^\{]+\{)/ig).exec(source)
        if (result) {
            let comment = result[2]
            let signature = result[3].slice(0, -2).trim()
            console.log(`      // ${comment}`)
            console.log(`      ${signature}
            `)
        } else {
            throw new Error("Could not parse command:\n" + source)
        }
    }
    return 0
} else {
    let command = require(`../lib/commands/${name}`).default
    if (command == null) {
        console.error(`Command not found: ${name}`)
    } else {
        try {
            return command(argumentJSON ? JSON.parse(argumentJSON) : undefined)
        } catch (e) {
            console.log(e)
            console.error(`Invalid JSON argument to command ${name}: ${argumentJSON}`)
        }
    }
    return 1
}
