import * as common from "../common"

//  inspects a .test.ts file if it contains a debugger statement
export default function debug() {
    let files = common.findInFilesRecursive(/\bdebugger\b/, /\.test\.js$/, "./lib/")
    if (files.length != 1) {
        common.error(`Expected one test.ts file with debugger in it, found : ${files.join(",")}`)
        return
    }
    let [debugFile] = files
    // inspect  some/test/file.js
    common.runSync("node", ["--inspect-brk", "node_modules/ava/profile.js", debugFile])
}
