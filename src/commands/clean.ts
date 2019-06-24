import * as common from "../common"

//  removes all generated files
export default function clean() {
    common.runSync("yarn", ["unlink"])
    common.runSync("rm", ["-f", ".gitignore", "tsconfig.json", "webpack.config.js", ".npmrc", ".gcloudignore"])
    common.runSync("rm", ["-rf", "lib"])
    common.runSync("rm", ["-rf", "node_modules"])
}
