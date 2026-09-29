const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email :{
        type: String,
        require : true
    },
    otp :{
        type: String,
        require : true
    },
    action :{
        type : String,
        enum :  ['account_verification', 'event_booking'],
        require : true
    },
    createdAt :{
        type : Date,
        default  : Date.now,
        expires : 300 // 5min
    }
})

module.exports = mongoose.model('OTP',otpSchema);