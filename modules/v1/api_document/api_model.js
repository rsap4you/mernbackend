var con = require('../../../config/database');
var GLOBALS = require('../../../config/constant');
const UserSchema = require("../../schema/user_schema");

var API = {

    /**
     * Function to get api users list
     * 04-06-2021
     * @param {Function} callback 
     */
    async apiuserList() {
        let data = await UserSchema.find({ $and: [{ is_active: "1" }, { is_deleted: "0" }] });
        if (data.length > 0) {
            // console.log("data", data);
            return data;
        } else {
            return null;
        }
    }
}

module.exports = API;