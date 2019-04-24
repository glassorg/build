import * as common from "../common"
import path from "path"
import compile from "./_compile"
import _copyDefaultFiles from "./_copyDefaultFiles"

//  installs and links dependencies and builds project 
export default function setup() {
    //  we have to copy the .npmrc file before we yarn install
    _copyDefaultFiles(false)

    let isWebsite = common.isWebsite()
    common.runSync("yarn", ["install"])
    && (isWebsite ? common.runSync("yarn", ["link", "@krisnye/glass-platform"]) : true)
    && compile(false)
    && (() => {
        common.runSync("yarn", ["unlink"], { cwd: path.join(process.cwd(), "./lib") })
        common.runSync("yarn", ["link"], { cwd: path.join(process.cwd(), "./lib") })
    })()
}
