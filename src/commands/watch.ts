import compile from "./_compile"

//  watches and continuously rebuilds the project
export default function watch(debug: boolean = false) {
    compile(true, debug)
}