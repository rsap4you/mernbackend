const mongoose = require('mongoose');
const { Schema } = mongoose;

const privacySchema = mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
    
    },
        summary: {
          type: String,
          required: true,
        },
        detail: {
          type: String,
          required: true,
        },
        status: {
          type: Number,
          default: 1,
          enum: [0, 1], 
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

const privacyModel = mongoose.model('tbl_privacy_policy', privacySchema, 'tbl_privacy_policy');
module.exports = privacyModel;