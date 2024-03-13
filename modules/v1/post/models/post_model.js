const randtoken = require('rand-token').generator();
const common = require("../../../../config/common");
const lang = require("../../../../config/language");
const Codes = require("../../../../config/status_codes");
const PostSchema = require("../../../schema/post_schema");
const middleware = require("../../../../middleware/headerValidator");
const template = require("../../../../config/template");
const redis = require("../../../../config/redis");

const postModel = {
    async add_post(req, res) {
        console.log('req: ', req);
        let request = {
            user_id: req.user_id,
            message: req.message
        }
        if (req.post_media.length > 0) {
            request.media = req.post_media
        }
        const newPost = new PostSchema(request);
        newPost.validate().then(() => {
            newPost.save().then(response => {
                // delete response.password;
                return middleware.sendResponse(res, Codes.SUCCESS, lang[req.language].rest_keywords_success_message, response);
            }).catch((error) => {
                return middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_addpostdata_error_message, error);
            });
        }).catch((error) => {
            console.log('error: ', error);
            return middleware.sendResponse(res, Codes.INTERNAL_ERROR, lang[req.language].rest_keywords_err_message, error);
        });
    },
    async post_feed_list(req, res) {
        const result = await PostSchema.aggregate([
            {
                $match: {
                    is_active: "1",
                    is_deleted: "0"
                }
            },
            {
                $lookup: {
                    from: 'tbl_user',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    'user.first_name': 1,
                    'user.last_name': 1,
                    'user_id': 1,
                    'comment_count': 1,
                    'like_count': 1,
                    'share_count': 1,
                    'save_count': 1,
                    'tag_count': 1,
                    'message': 1,
                    'media': 1,
                    'created_at': 1,
                }
            },
            { $sort: { created_at: -1 } }
        ]);

        if (result) {
            return middleware.sendResponse(res, Codes.SUCCESS, lang[req.language].rest_keywords_post_feed_list_success, result);
        } else {
            return await middleware.sendResponse(res, Codes.ERROR, lang[req.language].rest_keywords_no_data_message, null);
        }

    },
}

module.exports = postModel;
