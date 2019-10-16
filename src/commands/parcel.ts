import * as common from "../common"

//  bundles the www/*.ts pages with parcel
export default function parcel(mode: "watch" | "build" = "watch") {
    //  get the entry page.ts files
    let webSrcRoot = "./src/www/"
    let webLibRoot = "./lib/www/"
    let files = common.getFilesRecursive(webSrcRoot, /\.ts$/).map(file => file.slice(0, - ".ts".length))
    let entryFiles: string[] = []
    for (let file of files) {
        //  for each of these ts files make sure there is a corresponding .html file in lib
        //  or else generate one for it
        let srcHtmlFile = webSrcRoot + file + ".html"
        let libHtmlFile = webLibRoot + file + ".html"
        entryFiles.push(libHtmlFile)
        if (common.exists(srcHtmlFile)) {
            common.copyFile(srcHtmlFile, libHtmlFile)
        }
        else {
            common.write(
                libHtmlFile,
                `<html><body><script src="${file}.js"></script></body></html>`
            )
        }
    }
    return common.run("parcel", [...(mode === "watch" ? [] : ["build"]), ...entryFiles])
}
