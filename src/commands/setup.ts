import * as common from "../common"
import path from "path"
import compile from "./_compile"
import _copyDefaultFiles from "./_copyDefaultFiles"

function linkToLocalDependencies() {
    let { link } = common.getPackageJson()
    if (Array.isArray(link)) {
        for (let dependency of link) {
            if (!common.runSync("yarn", ["link", dependency]))
                return false
        }
    }
    return true
}

//  installs and links dependencies and builds project 
export default function setup() {
    //  we have to copy the .npmrc file before we yarn install
    _copyDefaultFiles(false)

    let isWebsite = common.isWebsite()
    common.runSync("yarn", ["install"])
    && linkToLocalDependencies()
    && compile(false)
    && (() => {
        common.runSync("yarn", ["unlink"], { cwd: path.join(process.cwd(), "./lib") })
        common.runSync("yarn", ["link"], { cwd: path.join(process.cwd(), "./lib") })
    })()
}
