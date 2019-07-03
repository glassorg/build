import * as common from "../common";
import webpack from "./webpack";
import build from "./build";
import path from "path";

//  deploys a web server or publishes a library
export default function deploy(verbose = false) {
    let { name, id, private: _private } = common.getPackageJson()
    if (!common.isWebsite()) {
        common.runSync("yarn", ["version", "--patch"])
        && build()
        && common.runSync("yarn", ["publish", "--access", _private ? "private" : "public", "--non-interactive"], { cwd: path.join(process.cwd(), "./lib") })
    } else {
        webpack("development")
        && common.runSync("gcloud", ["app", "deploy", "-q", `--project=${id || name}`, verbose ? `--verbosity=debug`: ""])
        && common.log(`To debug deployment issues, check the "Cloud Build" logs here:\n  https://console.cloud.google.com/logs/viewer?project=${name}`)
    }
    common.runSync("say", `${id || name} deployment finished`.split(' '))
}
