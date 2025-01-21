const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    comment_count: {
        type: Number,
        required: true,
        default: 0
    },
    like_count: {
        type: Number,
        required: true,
        default: 0
    },
    share_count: {
        type: Number,
        required: true,
        default: 0
    },
    save_count: {
        type: Number,
        required: true,
        default: 0
    },
    tag_count: {
        type: Number,
        required: true,
        default: 0
    },
    message: {
        type: String,
        required: true
    },
    media: {
        type: Array,
        required: true,
        default: []
    },
    is_active: {
        type: String,
        description: "0 : inActive, 1 : Active",
        default: "1",
        enum: ["0", "1"]
    },
    is_deleted: {
        type: String,
        description: "0 : Not Deleted, 1 : Delete ",
        default: "0",
        enum: ["0", "1"]
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const homeModel = mongoose.model('tbl_post', postSchema, 'tbl_post');
module.exports = homeModel;