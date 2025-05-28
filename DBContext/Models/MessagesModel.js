const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
{
    text:{
        type:String,
        required : true
    },
    reciverId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
}, 
    {
    timestamps: true,
})

const messageModel = mongoose.model("Message", messageSchema);
module.exports = messageModel;
