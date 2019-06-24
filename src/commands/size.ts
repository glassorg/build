import * as common from "../common"
import * as path from "path"

//  prints the total size file types recursively by extension
export default function size() {
    common.runSync(path.join(__dirname, "../../bin/sizebyext.sh"))
}
