const mongoose = require("mongoose");
const subscriberschema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    subscriberat: {
        type:Date,
        default:Date.now,
    }
});
module.exports =mongoose.model("Subscriber",subscriberschema);