const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId : {type: mongoose.Schema.Types.ObjectId,ref: "UserDetails"},
    logintime : {type : Date,default: Date.now},
})

const userlogs = mongoose.model("userlogs",userSchema)

module.exports = userlogs