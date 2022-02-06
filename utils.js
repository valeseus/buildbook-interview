const fs = require('fs')

// Opens file & parses into JSON. If it is not able to be parsed into JSON, or any other issues, will throw an error.
const readAndParseFileData = async filePath => {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8')
        return JSON.parse(data)
    } catch(err) {
        throw err
    }
}

const stringifyAndWriteFile = async(filepath, data) => {
    try {
        await fs.promises.writeFile(filepath, JSON.stringify(data), 'utf8')
    } catch (err) {
        throw err
    }
}

// Ensures that the correct base-level input format was provided. If these fail, the application would crash without handling them.
const validateInput = (originalData, changesData) => {
    if (!Array.isArray(originalData.users) || !Array.isArray(originalData.playlists) || !Array.isArray(originalData.songs)) throw new Error(errorMessages.invalidOriginalFormat)

    if (!Array.isArray(changesData)) throw new Error(errorMessages.invalidChangesFormat)
}

const promptCompletedMessage = (numSuccessChanges, numFailedChanges) => {
    console.log(`There were a total of ${numSuccessChanges} successful changes and ${numFailedChanges} failed changes. ${numFailedChanges > 0 ? 'Please go to output-failures.json in the project directory to see the failed changes. Once you resolve the issues, re-upload that file.' : ''}`)
}

module.exports = { readAndParseFileData, stringifyAndWriteFile, validateInput, promptCompletedMessage }