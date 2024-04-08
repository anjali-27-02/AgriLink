const { default: mongoose, model } = require("mongoose");


const UserDetailSchema=mongoose.Schema({
    id:{
        type:Number,
        autoIncrement:true
    },
    name:{
        type:String,
        
    },
    address:{
        type:String,
       
    },
    phone:String,
    aadhar:{
        public_id:{
            type:String,
           
        },
        url:{
            type:String,
           
        }
    },
    panCard:{
        public_id:{
            type:String,
           
        },
        url:{
            type:String,
            
        }
    },
    profile:{
        public_id:{
            type:String,
            
        },
        url:{
            type:String,
            
        }
    }
})

const UsersDetail=new mongoose.model('UsersDetail',UserDetailSchema);
module.exports=UsersDetail;