import * as common from "../common"
import { realpathSync } from "fs";

//  starts a web server application
export default function start(development: boolean = false, debug: boolean = false) {
    if (development) {
        if (debug) {
            common.run("nodemon", ["-d", "1", "-w", "lib", "-w", realpathSync("node_modules/@krisnye/glass-platform"), "-x", "node", "--inspect-brk", "lib/server.js"])
        } else {
            // we watch glass-platform since www/api handlers are loaded directly from it
            common.run("nodemon", ["-d", "1", "-w", "lib", "-w", realpathSync("node_modules/@krisnye/glass-platform"), "lib/server.js"])
        }
    } else {
        common.run("node", ["lib/server.js"])
    }
}
