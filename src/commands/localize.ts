#!  /usr/bin/env node
//Imports the Google Cloud client library
import { Translate } from "@google-cloud/translate"
import fs from "fs"
import path from "path"
import * as common from "./../common"

// sets the location of the google credentials
//process.env.GOOGLE_APPLICATION_CREDENTIALS = "/home/orion/Projects/glass2/build/credentials.json"

export default function localize() {
    // Your Google Cloud Platform project ID
    const projectId = 'x-point-developm-1545106839249';

    //  Grab Config Data from specified "Config" file
    let config = {
        input: {
            language: "en",
            directory: path.join(process.cwd(), "./src/")
        },
        output: {
            languages: ["de", "es", "fr", "zh"],
            directory: path.join(process.cwd(), "./lib/localize")
        }

    }
    //  Pull out the values into variables
    let outputDir = config.output.directory
    common.makeDirectory(outputDir)
    let outputLangs = config.output.languages
    let srcDir = config.input.directory
    let srcLang = config.input.language
    //  Variables for file creation
    let baseFileName = srcLang + ".json"
    let baseFilePath = path.join(outputDir, baseFileName)

    //  Part One, EXTRACTS ALL LOCALIZE DATA, Run functions to filter data into variables
    let files = common.getFilesRecursive(srcDir).filter(filename => !filename.endsWith("test.ts"))
    console.log(files)
    let srcData = getCombinedSourceCode(files)
    let matches = getMatches(srcData)//  anything with "localize" in front of it, then removes variables
    console.log(matches)
    let textObject = getTextObject(matches)
    console.log(textObject)
    let jsonText = JSON.stringify(textObject, null, 4)
    common.write(baseFilePath, jsonText)//  Prints out the file
    console.log("Generated : " + baseFilePath)

    function getCombinedSourceCode(filenames){
        let allData: string[] = []
        filenames.forEach(file => {
            let filePath = path.join(srcDir, file)
            let fileData = fs.readFileSync(filePath).toString()
            allData.push(fileData)
        })
        return(allData.concat(" ").toString())
    }
    function getMatches(data: string) {
        let localizeFinder = /\blocalize`[^`]*/g
        let varFinder = /\${[^}]*}/g
        let varPlaceholder = "[0]"//  temporary holder
        let chunks = data.match(localizeFinder)
        let chunksMapped
        if (chunks != null) {
            chunksMapped = chunks.map(match => {
                let noLocalize = match.slice(9, match.length)
                let noVariables = noLocalize.replace(varFinder, varPlaceholder)
                return noVariables
            })
        }
        return(chunksMapped)
    }
    function getTextObject(chunks){
        let textMap = new Object()
        if (chunks == null) {
            return textMap
        }
        chunks.forEach(match => {
            textMap[match] = match
        })
        return textMap
    }

    //  Part Two, TRANSLATES THE DATA

    //  Instantiates a client using default project and credentials.
    const translate = new Translate()

    //  Checks to see if minimum parameters were passed in
    if (process.argv.length < 3) {
        console.log(
    `
    Usage:

        node localize.js src/apps/demo/client/localize/config.json
    `
        )
    } else {
        //  Read file created by Part One
        const oldData = JSON.parse(fs.readFileSync(baseFilePath).toString())
        //  Values pulled from "oldData"
        const propValues: string[] = Object.values(oldData)
        const propNames = Object.keys(oldData)
        const fileType = ".json"
        
        //  Translates Into all given languages
        for (let language of outputLangs){
            let newFileName = language + fileType
            let newFilePath = path.join(outputDir, newFileName)
            let newData = {}
        
            //  translate Text
            translate
                .translate(propValues, language)
                .then(results => {
                    const translation = results[0]
                    for (let i = 0; i < translation.length; i++) {
                        //  creates properties on foreign language object
                        newData[propNames[i]] = translation[i]
                    }
                    common.write(newFilePath, JSON.stringify(newData, null, 4))
                })
                .catch(err => {
                    console.error("ERROR:", err)
                    process.exit(1)
                })
        }
    }
}