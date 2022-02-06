const validChangeActionHash = {
    addExistingSongToExistingPlaylist: 1,
    addNewPlaylistToExistingUser: 1,
    removeExistingPlaylist: 1
}

const errorMessages = {
    invalidOriginalFormat: `The changes file provided is not in the correct format. View the README for more information on input format.`,
    invalidChangesFormat: `The changes file provided is not in the correct format. View the README for more information on input format.`,
    missingTypeOrData: 'This action is either missing the "type" or "data" fields.',
    invalidType: `This action type is invalid. Please use one of these action types: ${Object.keys(validChangeActionHash).join(', ')}`,
    invalidData: `This action data is invalid. Please use an array or an object for the data field.`,
    playlistNotFound: 'The playlist was not found.',
    atleastOneSong: 'At least one existing song is required.',
    userNotFound: 'The user was not found.'
}

module.exports = { validChangeActionHash, errorMessages }