import * as common from "../common"

export default function _copyDefaultFiles(watch: boolean = false) {
    let isWebsite = common.isWebsite()

    if (isWebsite) {
        //  copy the sample app.yaml
        common.copyFile(`${__dirname}/../../defaultProjectFiles/app.yaml`, "app.yaml", { overwrite: false, watch })

        //  copy the sample .gcloudignore
        common.copyFile(`${__dirname}/../../defaultProjectFiles/.gcloudignore`, ".gcloudignore", { overwrite: true, watch })
    }

    //  copy the sample .gitignore
    common.copyFile(`${__dirname}/../../defaultProjectFiles/_.gitignore`, ".gitignore", { overwrite: true, watch })

    //  copy the sample tsconfig.json
    common.copyFile(`${__dirname}/../../defaultProjectFiles/tsconfig.json`, "tsconfig.json", { overwrite: true, watch })

}
