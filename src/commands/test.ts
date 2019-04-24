import * as common from "../common"

//  runs unit tests
export default function test(watch: boolean = false) {
    if (watch)
        return common.run("ava", ["--watch"])
    else
        return common.runSync("ava", [])
}
