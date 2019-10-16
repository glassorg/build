import * as common from "../common"

let webFiles = {
    "app.yaml": false,
    ".gcloudignore": false
}
let allFiles = {
    "_.gitignore": true,
    ".gcloudignore": true,
    "tsconfig.json": true,
    ".browserslistrc": true
}

export default function _copyDefaultFiles(watch: boolean = false) {
    let isWebsite = common.isWebsite()

    function copy(files) {
        for (let file in files) {
            let overwrite = files[file]
            let input = file
            let output = file.startsWith("_") ? file.slice(1) : file
            common.copyFile(`${__dirname}/../../defaultProjectFiles/${input}`, output, { overwrite, watch })
        }
    }

    if (isWebsite) {
        copy(webFiles)
    }
    copy(allFiles)
}
