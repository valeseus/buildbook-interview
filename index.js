const { addExistingSongToExistingPlaylist, addNewPlaylistToExistingUser, removeExistingPlaylist } = require('./actions')
const { readAndParseFileData, stringifyAndWriteFile, validateInput, promptCompletedMessage } = require('./utils')
const { validChangeActionHash, errorMessages } = require('./constants')
const args = process.argv

async function start(input, changes, output){
    const originalData = await readAndParseFileData(input)
    const changesData = await readAndParseFileData(changes)

    // Ensures inputs are valid
    validateInput(originalData, changesData)

    // I could have used better naming conventions here, I realize there is a lot of "data"s. This function is calling the manipulation functions and then returning that array, as well as successful and failed changes.
    const { modifiedData, failedChanges, successfulChanges } = changesData.reduce((acc, changeAction, index) => {
        const { type, data } = changeAction

        function failedChange(reason) {
            return { modifiedData: acc.modifiedData, failedChanges: [...acc.failedChanges, ({ index, ...changeAction, reason })], successfulChanges: acc.successfulChanges }
        }

        function successfulChange(updatedOriginalData) {
            return { modifiedData: updatedOriginalData, failedChanges: acc.failedChanges, successfulChanges: [...acc.successfulChanges, changeAction]}
        }

        // No action type or no action data
        if (!type || !data) return failedChange(errorMessages.missingTypeOrData)

        // Invalid action type (not in validChangeActionHash)
        if (!validChangeActionHash[type]) return failedChange(errorMessages.invalidType)

        // Invalid data type (not array or object)
        if (!typeof data === 'object') return failedChange(errorMessages.invalidData)

        switch (type) {
            case 'addExistingSongToExistingPlaylist':
                try {
                    addExistingSongToExistingPlaylist(acc.modifiedData, { songId: data.songId, playlistId: data.playlistId })
                    break
                } catch (err) {
                    return failedChange(err.message)
                }
            case 'addNewPlaylistToExistingUser':
                try {
                    addNewPlaylistToExistingUser(acc.modifiedData, { userId: data.userId, songIds: data.songIds })
                    break
                } catch (err) {
                    return failedChange(err.message)
                }
            case 'removeExistingPlaylist':
                try {
                    removeExistingPlaylist(acc.modifiedData, { playlistId: data.playlistId })
                    break
                } catch (err) {
                    return failedChange(err.message)
                }
        }
        
        return successfulChange(acc.modifiedData)
    }, { modifiedData: originalData, failedChanges: [], successfulChanges: [] })

    // Write updated file & failed attempts to output.json and failed-output.json, respectively
    await stringifyAndWriteFile(output ?? 'output.json', modifiedData)
    if (failedChanges.length) await stringifyAndWriteFile('failed-output.json', failedChanges)

    // Tell the user the # of their successful and failed changes, then exit the program.
    promptCompletedMessage(successfulChanges.length, failedChanges.length)
    process.exit()
}

start(args[2], args[3])