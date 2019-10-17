import * as common from "../common"
import webpack from "./webpack"
import start from "./start"
import test from "./test"
import path from "path"
import _copyDefaultFiles from "./_copyDefaultFiles"
import parcel from "./parcel"

function copyPackageJson() {
    // TODO: Maybe apply changes from package.json in src
    common.copyFile("package.json", "lib/package.json")
}

//  compiles src folder and outputs to lib
export default function compile(watch: boolean = false, debug: boolean = false) {
    let isWebsite = common.isWebsite()

    if (watch && !common.exists("lib")) {
        common.error("You should run 'guild setup' first")
        return 0
    }

    if (!common.exists("package.json")) {
        common.error("package.json not found")
        return 0
    }

    common.makeDirectory("lib")

    _copyDefaultFiles(watch)

    //  copy www from dependent libraries
    let packageJson = JSON.parse(common.read("package.json")!)!
    let useParcel = (packageJson.devDependencies || packageJson.dependencies || {})["parcel-bundler"] != null
    for (let name in packageJson.dependencies || {}) {
        let sourceDir = path.join(`./node_modules/${name}/www`)
        if (common.exists(sourceDir)) {
            common.copyDirectory(sourceDir, "lib/www", {
                overwrite: true,
                watch,
                filter(content: Buffer, name: string) {
                    if (/(\.ts|\.js)$/.test(name) && /\/api\//.test(name)) {
                        //  we don't copy api handlers
                        //  we try to load them from glass at runtime from glass
                        return null
                    }
                    return content
                }
            })
        }
    }

    // copy resource files from src to lib
    common.copyDirectory(
        "src", "lib", {
            watch, filter(content, name) {
                return /\.(css|json|glsl|vert|frag|png|svg)$/.test(name) ? content : null
            }
        }
    )

    //  copy www directory to lib
    if (common.exists("./src/www")) {
        common.copyDirectory("src/www", "lib/www", {
            overwrite: true,
            watch,
            filter(content: Buffer, name: string) {
                if (name.endsWith(".ts"))
                    return null
                return content
            }
        })
    }

    function bundle() {
        if (useParcel) {
            return parcel(watch ? "watch" : "build")
        }
        else {
            if (watch) {
                start(true, debug)
            }
            return webpack(watch ? "watch" : "production")
        }
    }

    if (watch) {
        common.watchFile("package.json", copyPackageJson)
        common.run("tsc", ["-w"])
        if (isWebsite) {
            bundle()
        }
        // // delay the test start a few seconds
        // setTimeout(() => {
        //     test(true)
        // }, 4000)
    } else {
        copyPackageJson()
        return common.runSync("tsc", [])
            && (isWebsite ? bundle() : true)
            // && test()
    }
}
