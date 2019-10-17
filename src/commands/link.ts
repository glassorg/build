import * as common from "../common"
import path from "path"
import compile from "./_compile"
import _copyDefaultFiles from "./_copyDefaultFiles"
import fs from "fs"

/**
 * Automatically links to any peer projects that are within your dependencies.
 */
function linkToLocalDependencies() {
    let thisPackage = common.getPackageJson()
    let deps = Object.assign({}, thisPackage.dependencies, thisPackage.devDependencies)

    let parent = path.dirname(process.cwd())
    let peers = fs.readdirSync(parent)
    for (let peer of peers) {
        let packagePath = path.join(parent, peer, "package.json")
        if (common.exists(packagePath)) {
            let peerPackage = JSON.parse(common.read(packagePath)!)
            if (deps[peerPackage.name]) {
                if (!common.runSync("yarn", ["link", peerPackage.name])) {
                    return false
                }
            }
        }
    }
    return true
}

//  installs and links dependencies and builds project 
export default function setup() {
    _copyDefaultFiles(false)

    linkToLocalDependencies()
    && compile(false)
    && (() => {
        common.runSync("yarn", ["unlink"], { cwd: path.join(process.cwd(), "./lib") })
        common.runSync("yarn", ["link"], { cwd: path.join(process.cwd(), "./lib") })
    })()
}
