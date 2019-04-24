import * as fs from "fs"
import * as path from "path"
import { spawn, spawnSync, SpawnOptions } from "child_process"

export function getPackageJson() {
    let json = read("package.json")
    if (json == null) {
        throw new Error("package.json not found")
    }
    return JSON.parse(json)
}

export function isWebsite() {
    return exists("./src/server.ts")
}

export function log(message: string) {
    console.log(`\x1b[36m${message}\x1b[0m`)
}

export function error(message: string) {
    console.log(`\x1b[31m${message}\x1b[0m`)
    return 1
}

export function logRun(command: string, args: string[] = [], options?: SpawnOptions) {
    let action = "Running"
    if (options && options.cwd && (options.cwd !== process.cwd())) {
        action = `Running from ${path.relative(process.cwd(), options!.cwd!)}`
    }
    log(`${action}: ${[command, ...args].join(" ")}`)
}

export function run(command: string, args: string[] = [], options?: SpawnOptions) {
    logRun(command, args, options)
    let cp = spawn(command, args, { stdio: [process.stdin, process.stdout, process.stderr], ...options })
    cp.on("error", (err) => {
        error(`Error running ${command} ${args.join(' ')}: ${err}`)
    })
}

export function runSync(command: string, args: string[] = [], options?: SpawnOptions): boolean {
    logRun(command, args, options)
    let result = spawnSync(command, args, { stdio: [process.stdin, process.stdout, process.stderr], ...options })
    if (result.error) {
        error(`Error running ${command} ${args.join(' ')}: ${result.error}`)
    }
    return result.status === 0
}

export function exists(file: string) {
    try {
        return fs.statSync(file) != null
    } catch (e) {
        return false
    }
}

export function readBuffer(file: string): Buffer | null {
    if (!exists(file))
        return null
    return fs.readFileSync(file)
}

export function read(file: string): string | null {
    let buffer = readBuffer(file)
    return buffer != null ? buffer.toString() : null
}

export function write(file: string, content: string | Buffer | null) {
    makeDirectory(path.dirname(file))
    if (read(file) !== content) {
        if (content == null) {
            log(`Deleting: ${path.relative(process.cwd(), file)}`)
            fs.unlinkSync(file)
        } else {
            log(`Writing: ${path.relative(process.cwd(), file)}`)
            fs.writeFileSync(file, content, typeof content === "string" ? { encoding: "utf8" } : {})
        }
    }
    return true
}

export function makeDirectory(name: string, silent: boolean = false) {
    if (!exists(name)) {
        let parentName = path.dirname(name)
        if (parentName !== name) {
            makeDirectory(path.dirname(name), true)
        }
        if (!silent) {
            log(`Created: ${path.relative(process.cwd(), name)}`)
        }
        fs.mkdirSync(name)
    }
}

export function copyFile(
    from: string,
    to: string,
    options: { overwrite?: boolean, watch?: boolean, filter?: (content: Buffer, name: string) => (Buffer | null) } = {}
) {
    let { overwrite = true, watch = false, filter = undefined } = options
    let content: string | Buffer | null = readBuffer(from)
    if (content != null && filter)
        content = filter(content, from)
    makeDirectory(path.dirname(to))

    if (watch) {
        watchFile(from, () => {
            copyFile(from, to, { overwrite, watch: false })
        })
    } else {
        if (overwrite || !exists(to)) {
            write(to, content)
        }
    }

    return true
}

export function copyDirectory(
    from: string,
    to: string,
    options: { overwrite?: boolean, watch?: boolean, filter?: (content: Buffer, name: string) => (Buffer | null) } = {}
) {
    function copyDescendantFile(file) {
        copyFile(
            path.join(from, file),
            path.join(to, file.startsWith('_') ? file.substring(1) : file),
            { overwrite: options.overwrite, watch: false, filter: options.filter }
        )
    }

    if (options.watch) {
        watchDirectory(from, /./, file => {
            copyDescendantFile(file)
        })
    } else {
        for (let file of getFilesRecursive(from)) {
            copyDescendantFile(file)
        }
    }
}

export function watchFile(file: string, callback: ((filename) => void)) {
    callback(file)
    fs.watchFile(file, { interval: 100 }, (curr, prev) => {
        if (curr == null || prev == null || curr.mtime !== prev.mtime) {
            callback(file)
        }
    })
}

export function watchDirectory(file: string, match: RegExp = /./, callback: ((filename: string) => void), recursive: boolean = true) {
    for (let filename of getFilesRecursive(file, match)) {
        callback(filename)
    }

    fs.watch(file, { recursive }, (eventType, filename) => {
        callback(filename.toString())
    })
}

export function isFile(file: string) {
    let stats = fs.statSync(file)
    return stats && stats.isFile()
}

export function isDirectory(file: string) {
    let stats = fs.statSync(file)
    return stats && stats.isDirectory()
}

function getFilesRecursiveInternal(root = __dirname, match: RegExp = /./, directory = root, files: string[] = []) {
    for (let name of fs.readdirSync(directory)) {
        let fullname = path.join(directory, name)
        let stats = fs.statSync(fullname)
        if (stats.isFile()) {
            let relative = path.relative(root, fullname)
            if (match.test(relative)) {
                files.push(relative)
            }
        } else if (stats.isDirectory()) {
            getFilesRecursiveInternal(root, match, fullname, files)
        }
    }
    return files
}

export function getFilesRecursive(root = __dirname, match: RegExp = /./) {
    return getFilesRecursiveInternal(root, match)
}

export function findInFilesRecursive(textMatch: RegExp, fileMatch: RegExp = /./, dir = __dirname) {
    let foundFiles: string[] = []
    for (let file of getFilesRecursive(dir, fileMatch)) {
        let fullpath = path.join(dir, file)
        let content = read(fullpath)
        if (content != null && textMatch.test(content)) {
            foundFiles.push(fullpath)
        }
    }
    return foundFiles
}