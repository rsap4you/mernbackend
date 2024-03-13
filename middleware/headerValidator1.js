const Validator = require('Validator');
const CryptLib = require('cryptlib');

const lang = require("../config/language");
const logger = require('../logger');
const Codes = require('../config/status_codes');
const UserSchema = require("../modules/schema/user_schema");

const shakey = CryptLib.getHashSha256(process.env.KEY, 32);


// methods that do not check token
const bypassMethod = new Array("resend-user-otp", "otp-verification", "register", "login", "update-password");

// method that not require api key
const bypassHeaderKey = new Array("sendnotification", "resetpasswordForm", "resetPass");

const headerValidator = {

    // function for extract accept language from request header and set in req globaly
    extractHeaderLanguage: async (req, res, next) => {
        try {
            const language = (req.headers['accept-language'] !== undefined && req.headers['accept-language'] !== '') ? (req.headers['accept-language'] === 'en-GB,en-US;q=0.9,en;q=0.8' ? 'en' : req.headers['accept-language']) : 'en';
            req.language = language;
            next()
        } catch (error) {
            logger.error(error.message);
        }

    },

    // Function to validate API key of header (Note : Header keys are encrypted)
    validateHeaderApiKey: async (req, res, next) => {
        try {
            const apiKey = req.headers['api-key'] !== undefined && req.headers['api-key'] !== "" ? req.headers['api-key'] : '';
            console.log("Success", apiKey);
            const pathData = req.path.split("/");
            if (bypassHeaderKey.indexOf(pathData[2]) === -1) {
                if (apiKey !== '') {
                    const decApiKey = CryptLib.decrypt(apiKey, shakey, process.env.IV)
                    console.log('decApiKey: ', decApiKey);
                    if (decApiKey === process.env.API_KEY) {
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
                        const token = CryptLib.decrypt(headerToken, shakey, process.env.IV);
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

    // Decrypt user request
    decryption: async (req) => {
        try {
            if (req !== undefined && Object.keys(req).length !== 0) {
                const request = JSON.parse(CryptLib.decrypt(req.body, shakey, process.env.IV));
                request.language = req.language;
                request.user_id = req.user_id;
                return request;
            }
        } catch (error) {
            return {};
        }

    },

    // Encrypt user request
    encryption: async (data) => {
        try {
            const encryptedData = CryptLib.encrypt(JSON.stringify(data), shakey, process.env.IV)
            return encryptedData;
        } catch (error) {
            return {};
        }
    },

    // function for send Response
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

    // check Validation Rules
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
module.exports = headerValidator