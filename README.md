# Running the Project

## Requirements

Node > 11

## Starting the Application

Make sure all the original, change, and output (optional) files are located in the directory. I didn't spend the time to make Node.js access files outside of the current directory.

Inside the project's directory, run `node index.js [ORIGINAL FILE NAME] [CHANGES FILE NAME] [OUTPUT FILE NAME]`

The output file name is optional; it will create an output.json in the project directory if you'd like.

## Expected Input

The original filepath should be the same format as the spotify.json mentioned here: https://gist.github.com/vitchell/a081703591116bab7e859cc000c98495

The changes.json should be in the same format as the changes-example.json in the project directory. See "Available Actions" for valid action objects.

**Available Actions**

- Add an existing song to an existing playlist.
  - `{ action: "addExistingSongToExistingPlaylist", data: { songId: string, playlistId: string } }`
- Add a new playlist for an existing user; the playlist should contain at least one existing song.
  - `{ action: "addNewPlaylistToExistingUser", data: { userId: string, songIds: string[] } }`
- Remove an existing playlist.
  - `{ action: "removeExistingPlaylist", data: { playlistId: string } }`

See changes-example.json for reference.

# Design Decisions

## Error Handling

1. For invalid JSON (not an array), I decided to immediately throw an error. The reasoning behind this is because none of the functionality would work at all if the data was not in an array format.

2. For invalid action "types" and action "data", I decided to push these errors to an array, and then inform the user of the errors & resolution steps after all of the computation was completed. I thought this was the appropriate approach to error handling here, because if there was a massive list (i.e. in the future), we would not want to spend N amount of time computing just to throw an error and have them restart the entire process from scratch.

Instead, the prompt tells them the number of successful and unsuccessful actions, and how to resolve the unsuccessful ones. By providing a JSON of failed actions, the user can modify accordingly and upload a shorter snippet of the data on their next attempt.

**NOTE: I ran out of time to error handle invalid IDs, like songIds & playlistIds.**

## Input Format

I chose to go with an { action: string, data: { } } (entity-based) format for the input JSON format.

_Initially, I had it set up to accept BOTH entity-based and action-based options, but I totally didn't realize how much of a hassle it would be to error handle the action-based input properly. I went with just an entity-based approach, but if I had more time I would accept the action-based approach listed below as well._

1. Entity-based -- If they have a list of single actions they want to take, they can easily just provide separate single actions & data entities for each.
   `[{ action: "action1", data: {dataEntity1} }, { action: "action1", data: {dataEntity2} }, { action: "action1", data: {dataEntity3} }]`

2. Action-based -- If they have some bulk action(s) they want to run on a large list of data, they can easily provide that list of data with a single action type.
   `[{ action: "action1", data: [dataList1] },{ action: "action2", data: [dataList2] }]`

Enabling an API to accept inputs in a variety of ways can be useful in some cases, like this. I imagine a customer-facing FE would have some sort of "bulk" action feature (add a list of songs from an album into a playlist), where you would want to just pass an array of selected items and their action.

#1 input format would make this easy for our FE team to implement considering the FE would already have a list of items in an array like [item, item, item]. Just tag an action with those items and you are good to go.

#2 input format would be useful for a public-facing API, since it allows developer freedom if they'd prefer to do provide input like this.

This does not impact the performance of the application, because the entity either lives as an object in the "action" loop, OR as an object in the "data" loop.

The other option (and personally I disagree with) would be to expect the input in the same exact format as the original file. I don't think this is a good decision because it would probably lead to entire reassignment of the original object, with the potential for missing/invalid data. Think of PUT vs PATCH. In some cases, PUT is useful, but I like that PATCH enables you to explicitly define what actions are allowed, without having to handle tons of cleaning & validation on the back-end. I'd love your thoughts on this option!

**NOTE: Something I found after I had finished the project was this library, http://jsonpatch.com/, and other similar libraries. I'm wondering if this would have been a better solution, as it's using an algorithm to compare JSONs and update the other one. The only problem I see with scaling this solution is the changes file would always be bigger than the source file, potentially bottlenecking the extraction side of the application. Also, would this library work with file streaming as mentioned in Scaling Solution #1?**

# Scaling

Future scaling problems:

1. Memory - This is the most obvious one. JSON.parse() can only handle up to 4MB & readFile() pulls the entire thing into memory.

2. Finding Data - This was not so obvious. More features will come with this application in the future, that may have multiple steps, not just single-dimension CRUD.

The solutions:

1. Memory - File streaming will fix the file size & memory problem. We can use file streaming to chunk data and process each chunk at a time.

2. Finding Data - File streaming helps for single-dimension CRUD actions, since we have all of the data we need in the current chunk of each iteration. However, when we have to run a multi-dimension action, like needing to validate other pieces of data in different parts of the file before we can make a modification.

   e.g. Global playlists, instead of user-based playlists. Right now, the playlists have an "owner_id". If we wanted to add an existing playlist to an a different user, we would duplicate that playlist and changing the ID (unless we just made owner_id an array, albeit removing the index-ability & making it harder to query). The better way to handle this would be to have an array of "playlist_ids" on the user object.

   Assuming we have a "playlist_ids" array on the user object, what happens when we delete that playlist with "removeExistingPlaylist", a feature that we have in this version? Do we leave it in the users "playlist_ids" array? Probably not a good practice. This is where the multi-dimension action comes in; we would arrive on "removeExistingPlaylist", which would be in [CHUNK 24488], but our users are scattered throughout [CHUNK 124], [CHUNK 189], [CHUNK 488], where we no longer have access to, because it was in a previous chunk.

   We will need to implement a database, with the ability to index IDs for much faster search.

   The other option would be to loop through the actions array and sort multi-dimension actions to the top, so that we can let the other actions know what their role in that multi-dimension action would be. Sounds like a nightmare for both developers and our EC2 costs.

# Conclusion

## Caveats

I noticed myself spending a lot of time trying to make a perfect application; there's obviously more work to be done here, like more validation. I went ahead and built the intended functionality assuming most data would be in the correct input (some validation is there!!).

## Remarks

I had a really fun time (obviously) on the system design part of this challenge. Thanks for putting this together, I appreciate the layout and see the value in running your technical interviews like this.

I will say, I do not have much of a data structures & algorithms background, as I am a self-taught engineer and have primarily been just producing features/refactoring code for the past 4 years. However, I am actively working towards understanding more of these concepts and I feel that the would have been useful in this coding challenge. Some of the decisions that I made could have been the incorrect decision, and I would appreciate any feedback provided.

## Total Hours - 6

1:00 research

3:00 building

2:00 writing this README, lol
