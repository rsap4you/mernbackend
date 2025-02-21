const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
    
    },
    full_name: {
        type: string,
        required: true,
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

const contactModel = mongoose.model('tbl_contact_us', postSchema, 'tbl_contact_us');
module.exports = contactModel;