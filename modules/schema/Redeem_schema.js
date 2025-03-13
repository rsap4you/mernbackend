const mongoose = require('mongoose');
const { Schema } = mongoose;

const redeemSchema = mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
    
    },
        email: {
          type: String,

        },
        mobile_number: {
          type: String,
         
        },
        points: {
            type: String,
          
          },
          rupees: {
            type: String,
            
          },
          upi_id: {
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

const RedeemModel = mongoose.model('tbl_redeem', redeemSchema, 'tbl_redeem');
module.exports = RedeemModel;