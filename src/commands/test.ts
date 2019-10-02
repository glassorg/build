import * as common from "../common"

//  runs unit tests
export default function test(watch: boolean = false) {
    let pack = common.getPackageJson()
    let hasAva = ( pack.dependencies && pack.dependencies.ava != null ) || (pack.devDependencies && pack.devDependencies.ava != null)
    if (watch) {
        if (hasAva) {
            return common.run("ava", ["--watch", "--verbose"])
        }
    }
    else {
        return common.runSync("ava", [])
    }
}
