const mongoose = require("mongoose")
var UserSchema = new mongoose.Schema({
    
    contact:Number,
    uname:String  
  
   });
   module.exports=mongoose.model("user_details",UserSchema)