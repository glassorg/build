import * as common from "../common"

//  runs unit tests
export default function test(watch: boolean = false) {
    let pack = common.getPackageJson()
    let hasAva = ( pack.dependencies && pack.dependencies.ava != null ) || (pack.devDependencies && pack.devDependencies.ava != null)
    let options = { cwd: "lib" }
    if (watch) {
        if (hasAva) {
            return common.run("ava", ["--watch", "--verbose"], options)
        }
    }
    else {
        return common.runSync("ava", [], options)
    }
}
