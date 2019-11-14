import * as common from "../common"

//  downloads a material design icon to the local src/www/icons/material folder
export default function icon(...names) {
    // https://fonts.gstatic.com/s/i/materialiconsoutlined/file_copy/v1/24px.svg?download=true
    let folder = "src/www/icons/material"
    for (let name of names.join(",").split(",")) {
        common.makeDirectory(folder)
        let file = `${folder}/${name}.svg`
        common.runSync("curl", [
            `https://fonts.gstatic.com/s/i/materialicons/${name}/v1/24px.svg?download=true`,
            `>`,
            file
        ])
        common.log(`Downloaded ${file}`)
    }
}
