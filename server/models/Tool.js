const mongoose=require("mongoose");
const toolSchema=new mongoose.Schema({
    name: { type: String, required: true},
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    image:{
        url:String,
        filename:String,
    },
    poweredBy: {
        type: String,
        default: null,
    },
});

module.exports=mongoose.model("Tool",toolSchema);