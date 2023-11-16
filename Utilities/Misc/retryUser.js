/**
 * @name RetryUser
 * @desc This function checks whether to try and fetch the user from the DB overtime
 */

import Player from "../../Classes/player.js"

export default async (userObj, postgres) => {

    // Check if Retry exists and return if under 5 minutes
    if (userObj.fetchRetry && Date.now() - userObj.fetchRetry < 60000 * 5) return false;

    // Ready User
    const user = new Player(userObj);

    // Fetch Columns
    await user.fetchColumns(postgres, "started, id, locale");

    // Return if Not Registered
    if (!user.started)
        return userObj.fetchRetry = Date.now(), false;

    // Return if Registered
    return user;
}