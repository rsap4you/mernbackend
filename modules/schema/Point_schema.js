const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
    
    },
    points: {
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

const postModel = mongoose.model('tbl_point', postSchema, 'tbl_point');
module.exports = postModel;



