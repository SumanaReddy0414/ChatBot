const mongoose = require("mongoose")
var UserSchema = new mongoose.Schema({
    
    contact:Number,
    uname:String , 
    issue:String,
    issueid:String,
    date: Date,
    status: String
   });
   module.exports=mongoose.model("issue_details",UserSchema)