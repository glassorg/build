import * as common from "../common"

//  creates google datastore indexes
export default function createIndexes() {
    if (!common.isWebsite()) {
        throw new Error("Only usable on websites")
    }
    let { name } = common.getPackageJson()
    common.runSync("gcloud", ["datastore", "indexes", "create", "--quiet", "--project", name, "index.yaml"])
}
