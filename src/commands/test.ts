import * as common from "../common"

//  runs unit tests
export default function test(watch: boolean = false) {
    let hasAva = ( common.getPackageJson().dependencies.ava != null ) || (common.getPackageJson().devDependencies.ava != null)
    if (watch) {
        if (hasAva) {
            return common.run("ava", ["--watch", "--verbose"])
        }
    }
    else {
        return common.runSync("ava", [])
    }
}
