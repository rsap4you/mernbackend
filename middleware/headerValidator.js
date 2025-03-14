const Validator = require('Validator');
const crypto = require('crypto-js')
const lang = require("../config/language");
const logger = require('../logger');
const Codes = require('../config/status_codes');
const UserSchema = require("../modules/schema/user_schema");

// const SECRET = crypto.enc.Hex.parse(process.env.KEY);
// const IV = crypto.enc.Hex.parse(process.env.IV);

const SECRET = crypto.enc.Utf8.parse(process.env.KEY);
const IV = crypto.enc.Utf8.parse(process.env.IV);

const bypassMethod = new Array("encryption_demo", "decryption_demo", "resend-user-otp", "otp-verification", "register", "login", "update-password","get_contacts_details","privacy_policy");

const bypassHeaderKey = new Array("encryption_demo", "decryption_demo", "sendnotification", "resetpasswordForm", "resetPass");

const headerValidator = {

    extractHeaderLanguage: async (req, res, next) => {
        try {
            const language = (req.headers['accept-language'] !== undefined && req.headers['accept-language'] !== '') ? (req.headers['accept-language'] === 'en-GB,en-US;q=0.9,en;q=0.8' ? 'en' : req.headers['accept-language']) : 'en';
            req.language = language;
            next()
        } catch (error) {
            logger.error(error.message);
        }

    },

    validateHeaderApiKey: async (req, res, next) => {
   
        try {
            const apiKey = req.headers['api-key'] !== undefined && req.headers['api-key'] !== "" ? req.headers['api-key'] : '';
            const pathData = req.path.split("/");
            if (bypassHeaderKey.indexOf(pathData[2]) === -1) {
                if (apiKey !== '') {
                    const decApiKey = (req.headers['api-key'] != undefined && req.headers['api-key'] != '') ? crypto.AES.decrypt(req.headers['api-key'], SECRET, { iv: IV }).toString(crypto.enc.Utf8) : "";
                
                    if (decApiKey === `"${process.env.API_KEY}"`) {
                        next();
                    } else {
                        return await headerValidator.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language].rest_keywords_api_notvalid_message, null);
                    }
                } else {
                    return await headerValidator.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language].rest_keywords_api_notvalid_message, null);
                }
            } else {
                next();
            }


        } catch (error) {
            logger.error(error.message);
            // return await headerValidator.sendResponse(res, Codes.INTERNAL_ERROR, 'An Error Occurred', null);
        }
        return false;
    },

    // Function to validate the token of any user before every request
    validateHeaderToken: async (req, res, next) => {
       
        try {
            const headerToken = (req.headers.token !== undefined && req.headers.token !== '') ? req.headers.token : '';
            const pathData = req.path.split("/");

            if (bypassMethod.indexOf(pathData[2]) === -1) {
                if (headerToken !== '') {
                    try {
                        let token = crypto.AES.decrypt(headerToken, SECRET, { iv: IV }).toString(crypto.enc.Utf8);
                        token = token.replace(/"/g, '');
                   
                        const userDetails = await UserSchema.findOne({ "device_info.token": token })
                     
                        if (userDetails !== null && userDetails !== undefined) {
                            req.user_id = userDetails.id;
                            next();
                        } else {
                            return headerValidator.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language].rest_keywords_token_notvalid_message, null);
                        }
                    } catch (error) {
                        return headerValidator.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language].rest_keywords_token_notvalid_message, null);
                    }
                } else {
                    return headerValidator.sendResponse(res, Codes.UNAUTHORIZED, lang[req.language].rest_keywords_token_notvalid_message, null);
                }
            } else {


                next();
            }
        } catch (error) {
            return headerValidator.sendResponse(res, Codes.INTERNAL_ERROR, 'An Error Occurred', null);
        }
        return false;
    },

    decryption: async (req) => {
        
        try {
    
            let data1 = {};
            
            const decryptedData = await crypto.AES.decrypt(req.body, SECRET, { iv: IV }).toString(crypto.enc.Utf8);
            let data = headerValidator.isJson(decryptedData);
            data1 = { ...data }; 
            data1.language = req.language; 
            data1.user_id = req.user_id;
            return data1;
        } catch (error) {
            console.log('error: ', error);
            return {};
        }
    },

    encryption: async (req) => {

        try {
            let data = headerValidator.isJson(req);
            const encryptedData = crypto.AES.encrypt(JSON.stringify(data), SECRET, { iv: IV }).toString();
            return encryptedData;

        } catch (error) {
            return {};
        }  

    },

    encryptiondemo: (req, res) => {
        try {
            let data = headerValidator.isJson(req);
            const encryptedData = crypto.AES.encrypt(JSON.stringify(data), SECRET, { iv: IV }).toString();
            res.json(encryptedData);

        } catch (error) {
            return '';
        }
    },

    decryptiondemo: async (req, res) => {
        try {
            const decryptedData = JSON.parse(crypto.AES.decrypt(req, SECRET, { iv: IV }).toString(crypto.enc.Utf8));
            let data = headerValidator.isJson(decryptedData);
            res.json(data);
        } catch (error) {
            return {};
            
        }

    },
    
    isJson: (req) => {

        try {
            const parsedObject = JSON.parse(req);
            return parsedObject;

        } catch (error) {
            return req;
     
        }

    },

    sendResponse: async (res, resCode, msgKey, resData) => {
        try {
            const responsejson =
            {
                "code": resCode,
                "message": msgKey

            }
            if (resData != null) {
                responsejson.data = resData;
            }
            const result = await headerValidator.encryption(responsejson);
            res.status(resCode).send(result);

        } catch (error) {
            logger.error(error.message);
        }

    },

    checkValidationRules: async (request, rules) => {
        try {
            const v = Validator.make(request, rules);
            const validator = {
                status: true,
            }
            if (v.fails()) {
                const ValidatorErrors = v.getErrors();
                validator.status = false
                for (const key in ValidatorErrors) {
                    validator.error = ValidatorErrors[key][0];
                    break;
                }
            }
            return validator;
        } catch (error) {
            logger.error(error.message);
        }
        return false;

    },

}
module.exports = headerValidator ;
