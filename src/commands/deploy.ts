import * as common from "../common"
import webpack from "./webpack"
import build from "./build"
import path from "path"

//  deploys a web server or publishes a library
export default function deploy(verbose = false) {
    if (!common.isWebsite()) {
        common.runSync("yarn", ["version", "--patch"])
        && build()
        && common.runSync("yarn", ["publish", "--non-interactive"], { cwd: path.join(process.cwd(), "./lib") })
    } else {
        let { name } = common.getPackageJson()
        webpack("development")
        && common.runSync("gcloud", ["app", "deploy", "-q", `--project=${name}`, verbose ? `--verbosity=debug`: ""])
        && common.log(`To debug deployment issues, check the "Cloud Build" logs here:\n  https://console.cloud.google.com/logs/viewer?project=${name}`)
    }
}
