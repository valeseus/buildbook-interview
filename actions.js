const { errorMessages } = require('./constants')

// --- Regarding all of the manipulation functions listed below ---
// I wasn't sure if the IDs of the original file were always going to be based on their index + 1, like they are in the provided original file. For this reason, I went with find, but if we had an object instead of an array it would be quicker to find the playlist because it would be keyed/indexed by the entity ID.

const addExistingSongToExistingPlaylist = (originalData, { songId, playlistId }) => {
    // Should probably check to see if it is a valid songId as well...
    const playlist = originalData.playlists.find(playlist => playlist.id === playlistId)
    if (!playlist?.song_ids) throw new Error(errorMessages.playlistNotFound)
    
    return playlist.song_ids.push(songId)
}

const addNewPlaylistToExistingUser = (originalData, { userId, songIds }) => {
    // Should probably check to see if it all song IDs are valid as well...
    if (songIds.length === 0) throw new Error(errorMessages.atleastOneSong)

    const user = originalData.users.find(user => user.id === userId)
    if (!user) throw new Error(errorMessages.userNotFound)

    return originalData.playlists.push({
        id: (originalData.playlists.length + 1).toString(),
        owner_id: userId,
        song_ids: songIds
    })
}

const removeExistingPlaylist = (originalData, { playlistId }) => {
    const indexOfPlaylist = originalData.playlists.findIndex(playlist => playlist.id === playlistId)

    if (indexOfPlaylist === -1) throw new Error(errorMessages.playlistNotFound)
    
    return originalData.playlists.splice(indexOfPlaylist, 1)
}

module.exports = { addExistingSongToExistingPlaylist, addNewPlaylistToExistingUser, removeExistingPlaylist }