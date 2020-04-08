const UserModel = require('../Models/UserModel');

exports.getUserID = async function (username) {
    return await UserModel.getUserID(username);
}

exports.deleteUser = async (userID) => {
    console.log(`delete user: ${userID}`);
}

exports.updateUsername = async (userID, username) => {
    console.log(`update ${userID} name to ${username}`);
}