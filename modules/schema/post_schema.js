const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    point: {
        type: Number,
        required: true,
        default: 0
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

const homeModel = mongoose.models.tbl_point || mongoose.model('tbl_post', postSchema, 'tbl_post');
module.exports = homeModel;

