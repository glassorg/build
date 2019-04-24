import * as common from "../common"
import path from "path"

//  webpacks the www/*.ts files
export default function webpack(mode: "watch" | "development" | "production" | "debug" = "development") {
    //  get the entry page.ts files
    let files = common.getFilesRecursive("./src/www", /\.ts$/)
    let webRoot = "./lib/www"
    for (let file of files) {
        writeHTMLForPage(webRoot, file)
    }
    //  write the webpack.config.js
    common.write("webpack.config.js", getWebPackConfigText(webRoot, files))
    if (mode == "watch") {
        return common.run("webpack-dev-server", [`--mode=development`])
    } else {
        return common.runSync("webpack", [`--mode=${mode === "debug" ? "none" : mode}`])
    }
}

function writeHTMLForPage(webRoot: string, file: string) {
    let name = file.substring(0, file.lastIndexOf('.'))
    common.write(path.join(webRoot, `${name}.html`), 
`<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <link rel="shortcut icon" href="/favicon.png">
        <meta name="viewport" content="width=device-width, initial-scale=1.0,  minimum-scale=1.0">
    </head>
    <body>
    <script type="text/javascript" src="${name}.pack.js"></script>
    </body>
</html>
`
)
}

function getWebPackConfigText(webRoot: string, files: string[]) {
    let entries: any = {}
    for (let file of files) {
        if (!file.startsWith("api/")) {
            let name = file.slice(0, -".ts".length)
            entries[name] = `${webRoot}/${name}.js`
        }
    }

    return `
// must add local build path to node paths
module.paths.push("${path.join(__dirname, "../../node_modules")}")
const path = require("path") 
const webroot = path.join(process.cwd(), "./lib/www")
const webpack = require("webpack")
let config = {
    entry: ${JSON.stringify(entries)},
    output: {
        path: webroot,
        filename: "[name].pack.js",
        publicPath: ""
    },
    devtool: "cheap-source-map",
    devServer: {
        contentBase: webroot,
        hot: true,
        host: "0.0.0.0",
        port: 8080,
        proxy: [{
            path: "/api/**",
            target: "http://localhost:3000",
            secure: false
        }]
    },
    module: {
        rules: [
            {
                test: /.svg$/,
                loader: 'file-loader'
            }
        ]
    },
    //  ignore the node "crypto" which is required by sjcl
    plugins: [
        new webpack.IgnorePlugin(/^crypto$/),
        new webpack.HotModuleReplacementPlugin()
    ]
}

module.exports = (env, argv) => {

    if (argv.mode === "development") {
        console.log("DEVELOPMENT")
    } else if (argv.mode === "production") {
        console.log("PRODUCTION")
    } else {
        console.log("DEBUG")
        const BundleAnalyzer = require("webpack-bundle-analyzer").BundleAnalyzerPlugin
        config.plugins.push(new BundleAnalyzer())
    }

    return config;
};
`
}
