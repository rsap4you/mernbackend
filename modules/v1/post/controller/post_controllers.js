const postModel = require("../models/post_model");
const Codes = require("../../../../config/status_codes");
const middleware = require("../../../../middleware/headerValidator");
const validationRules = require('../post_validation_rules');
var multer = require("multer");
var path = require("path");
const lang = require("../../../../config/language");

const add_post = async (req, res) => {
    const request = await middleware.decryption(req);
    // const request = req.body;
    const valid = await middleware.checkValidationRules(request, validationRules.addPostValidation)

    if (valid.status) {
        return postModel.add_post(request, res)
    } else {
        return middleware.sendResponse(res, Codes.VALIDATION_ERROR, valid.error, null);
    }
}
const post_feed_list = async (req, res) => {
    return postModel.post_feed_list(req, res)
}
const upload_postFile = async (req, res) => {
    let image_name = '';
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // cb(null, '../public/assets/profile_image/')
            // Node Public Folder Path
            cb(null, '../node_api/public/post_media/')
        },
        filename: function (req, file, cb) {
            //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            //   cb(null, file.fieldname + '-' + uniqueSuffix)
            // console.log(Date.now(),path.extname(file.originalname));
            image_name = Date.now() + path.extname(file.originalname);
            cb(null, image_name)
        }
    });
    const updimg = multer({
        storage: storage,
        limits: {
            fileSize: (200 * 1024 * 1024)
        }
    }).single("post_media");
    // var updmultiimage = updimg.fields([
    //     {
    //         name: 'post_media',
    //         maxCount: 3
    //     }
    // ]);
    updimg(req, res, function (err) {
        if (err) {
            console.log('err: ', err);
            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language].rest_keywords_err_message, err);
        } else {
            return middleware.sendResponse(res, Codes.SUCCESS, lang[req.language].rest_keywords_success_message, { post_media: image_name });

        }
    })
}

module.exports = {
    add_post,
    upload_postFile,
    post_feed_list
}