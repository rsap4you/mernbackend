const randtoken = require('rand-token').generator();
const common = require("../../../../config/common");
const lang = require("../../../../config/language");
const Codes = require("../../../../config/status_codes");
const UserSchema = require("../../../schema/user_schema");


const middleware = require("../../../../middleware/headerValidator");
const template = require("../../../../config/template");
const redis = require("../../../../config/redis");
const { log } = require('winston');

const userModel = {

    async register(req, res) {
       console.log('languageee',req.language);
       
        const checkEmailUnique = await common.checkUniqueEmail(req);
        if (checkEmailUnique) {
            return await middleware.sendResponse(res, Codes.ALREADY, lang[req.language].rest_keywords_unique_email_error, null)
        }
        const checkMobileUnique = await common.checkUniqueMobile(req.mobile_number);
        if (checkMobileUnique) {
            return await middleware.sendResponse(res, Codes.ALREADY, lang[req.language].rest_keywords_unique_mobilenumber_error, null)
        }
        const encPass = await middleware.encryption(req.password);

        const token = randtoken.generate(64, "0123456789abcdefghijklnmopqrstuvwxyz");
        const existingUser = await UserSchema.findOne({ 'device_info.token': token });

        if (existingUser) {
 
            return this.register(req, res);
        }

        let user_device = {
            token: token,
            device_type: (req.device_type !== undefined) ? req.device_type : "A",
            device_token: (req.device_token !== undefined) ? req.device_token : "1234",
        };

        let user = {
            first_name:  (req.first_name != undefined || req.first_name != null ) ? req.first_name : "",
            last_name:  (req.last_name != undefined || req.last_name != null) ? req.last_name : "",
            email: (req.email != undefined || req.email != null) ? req.email : "",
            mobile_number:(req.mobile_number != undefined || req.mobile_number != null) ? req.mobile_number : "",
            // password: encPass,
            password: (req.password != undefined || req.password != null) ? req.encPass : "",
            otp_code: (req.otp_code != undefined || req.otp_code != null) ? req.otp_code : "",
            is_verify: (req.is_verify != undefined || req.is_verify != null) ? req.is_verify : "0",
            profile_image: (req.profile_image != undefined || req.profile_image != null) ? req.profile_image : "default.jpg",
            device_info: user_device
        };

        let OTP = Math.floor(1000 + Math.random() * 9000);
        user.otp_code = OTP;

        const newUser = new UserSchema(user);``

        try {
            await newUser.validate();
            const response = await newUser.save();
         
            return middleware.sendResponse(res, Codes.SUCCESS, lang[req.language].rest_keywords_success_message, response);
        } catch (error) {
            return middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_adduserdata_error_message, error);
        }
    },

    async otp_verification(req, res) {
        const userData = await UserSchema.findOne({ $and: [{ email: req.email }, { is_active: "1" }, { is_deleted: "0" }] });
        if (!userData) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_userdatanotfound_message, null);
        }
        if (userData.otp_code != req.otp) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_userotpdata_notvalid_message, null);
        }
        
        let upd_params = {
            otp_code: "",
            is_verify: "1"
        }
        const filter = { email: req.email };
        const update = { $set: upd_params };
        let update_user = await UserSchema.updateOne(filter, update);
        if (update_user.modifiedCount <= 0) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_err_message, null);
        }
        const response = await UserSchema.findOne({ $and: [{ email: req.email }, { is_active: "1" }, { is_deleted: "0" }] });

        return await middleware.sendResponse(res, Codes.SUCCESS, lang[req.language].rest_keywords_otpverified_success_message, response);
    },

    async resend_user_otp(req, res) {
        const userData = await UserSchema.findOne({ $and: [{ mobile: req.mobile }, { is_active: "1" }, { is_deleted: "0" }] });
        if (!userData) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_userdatanotfound_message, null);
        }
        let OTP = Math.floor(1000 + Math.random() * 9000);
        let upd_params = {
            otp_code: OTP
        }
        const filter = { _id: userData._id };
        const update = { $set: upd_params };
        let update_user = await UserSchema.updateOne(filter, update);
        if (update_user.modifiedCount <= 0) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_err_message, null);
        }
     
        return await middleware.sendResponse(res, Codes.SUCCESS, lang[req.language].rest_keywords_sendotp_success_message, upd_params);
    },

    async login(req, res) {
        const userData = await UserSchema.findOne({ $and: [{ email: req.email }, { is_deleted: "0" }] });
    
        if (!userData) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_userdatanotfound_message, null);
        }
        if (userData.is_active == '0') {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_isactive_error_message, null);
        }
        let password = await middleware.encryption(req.password);
        if (userData.password != password) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_password_notvalid_message, null);
        }

        // if (userData.is_verify == "0") {
        //     let OTP = Math.floor(1000 + Math.random() * 9000);
        //     let upd_params = {
        //         otp_code: OTP
        //     }
        //     const filter = { _id: userData._id };
        //     const update = { $set: upd_params };
        //     let update_user = await UserSchema.updateOne(filter, update);
        //     if (update_user.modifiedCount <= 0) {
        //         return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_err_message, null);
        //     }
        //     return await middleware.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language].rest_keywords_sendotp_success_message, upd_params);
        // }

        const token = randtoken.generate(64, "0123456789abcdefghijklnmopqrstuvwxyz");
        let update_token = await UserSchema.updateOne(
            { _id: userData.id },
            { $set: { "device_info.token": token } }
        )
        if (update_token.modifiedCount <= 0) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_err_message, null);
        }

        let data = await userModel.getuserData(userData.id);
        return await middleware.sendResponse(res, Codes.SUCCESS, lang[req.language].rest_keywords_login_success_message, data);
    },

    async updatePassword(req, res) {
        const userData = await UserSchema.findOne({ $and: [{ mobile: req.mobile }, { is_deleted: "0" }] });
        if (!userData) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_userdatanotfound_message, null);
        }
        if (userData.is_active == '0') {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_isactive_error_message, null);
        }
        const new_password = await middleware.encryption(req.new_password);
        if (userData.password == new_password) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_same_password_message, null);
        }
        let upd_params = {
            password: new_password
        }
        const filter = { _id: userData._id };
        const update = { $set: upd_params };
        let update_pass = await UserSchema.updateOne(filter, update);
        if (update_pass.modifiedCount <= 0) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_err_message, null);
        }
        return await middleware.sendResponse(res, Codes.SUCCESS, lang[req.language].rest_keywords_password_change_success_message, null);
    },


    async editUser(req, res) {

        const userData = await UserSchema.findOne({ _id: { _id: req._id } });

        if (!userData) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_userdatanotfound_message, null);
        }
        if (userData.is_active == '0') {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_isactive_error_message, null);
        }

        let upd_params = {
            _id:req._id,
            first_name: req.first_name,
            last_name: req.last_name,
            email: req.email,
            mobile_number: req.mobile_number
        }

        const filter = { _id: userData._id };
        const update = { $set: upd_params };
        let update_pass = await UserSchema.updateOne(filter, update);
        if (update_pass.modifiedCount <= 0) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_err_message, null);
        }
        return await middleware.sendResponse(res, Codes.SUCCESS, 'success', null);
    },


    // ************************************active inactive user *****************************

    async active_inactive(req, res) {
        // Assuming req.body.is_active contains the status (1 or 0)
        let status = req.is_active;
        let updateFields = {
            "is_active": status,
        };

        let update_status = await UserSchema.updateOne(
            { _id: req.userId },
            { $set: updateFields }
        );
 
    
        if (update_status.modifiedCount <= 0) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_err_message, null);
        }
    
        return await middleware.sendResponse(res, Codes.SUCCESS, lang[req.language].rest_keywords_success_message   , null);
    },
    
    // ************************************active inactive user *****************************



    // ************************************Delete user *****************************
    
    async deleteuser(req, res) {

        let updateFields = {
            "is_deleted": 1,
            "is_active":0,

        };

        let update_status = await UserSchema.updateOne(
            { _id: req },
            { $set: updateFields }
        );


        if (update_status.modifiedCount <= 0) {
            return await middleware.sendResponse(res, Codes.ERROR, 'error ', null);
        }

        return await middleware.sendResponse(res, Codes.SUCCESS, 'success', null);
    },

    // ************************************Delete user *****************************

    async logout(req, res) {
        let update_token = await UserSchema.updateOne(
            { _id: req.user_id },
            { $set: { "device_info.token": "" } }
        )
        if (update_token.modifiedCount <= 0) {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_err_message, null);
        }
        return await middleware.sendResponse(res, Codes.SUCCESS, lang[req.language].rest_keywords_logout_success_message, null);
    },

    async userList(req, res) {
        const userlistdetails = await UserSchema.find({ is_deleted: { $ne: 1 } });

        if (userlistdetails.length > 0) {

            return await middleware.sendResponse(res, Codes.SUCCESS, 'Success', { userList: userlistdetails });
        } else {
            console.log('errrrr');
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_err_message, null);
        }
    },



    async getuserData(user_id) {
        let userData = await UserSchema.findOne({ _id: user_id });
        return userData;
    }
}

module.exports = userModel;
