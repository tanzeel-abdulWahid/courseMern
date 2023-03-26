import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
const schema = new mongoose.Schema({
    name:{
        type:String,
        required: [true,"Please enter your name"]
    },
    email:{
        type:String,
        required:[true, "Please enter your email"],
        validate: validator.isEmail,
        unique:true
    },
    password:{
        type:String,
        required:[true, "Please enter your password"],
        minLength:[6, "Password must be at least 6 characters"],
        select:false,
    },
    role:{
        type:String,
        enum:["admin","user"],
        default:"user",
    },
    subscription:{
        id:String,
        status:String,
    },
    avatar:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        },
    },
    playlist:[{
        course:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        },
        poster:String
    }],
    createdAt:{
        type:Date,
        default:Date.now,
    },
    // For password reset functionailty

    //Stores a random token sent to users email
    resetPasswordToken:String,

    //expiration date/time of password reset token
    resetPasswordExpire:String,
    
})

//Before saving doc in DB
schema.pre("save", async function(next) {

    // Dont re hash the pass if it is not modified
    if (!this.isModified("password")) return next();

    const hashedPassword = await bcrypt.hash(this.password, 10)
    this.password = hashedPassword;
    next();
})

//these methods are availabe on each doc that is created from this sceham
schema.methods.getJWTToken = function() {
    return jwt.sign({_id: this._id}, process.env.JWT_SECRET,
    {
        expiresIn: '15d',
    });
};

schema.methods.getResetToken = function(){
    const resetToken = crypto.randomBytes(20).toString('hex');

    //uses SHA256 algo to hash data
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; //15 mins exp time
    return resetToken;
}

schema.methods.comparePassword = async function(password) {
    // console.log(this.password)
    return await bcrypt.compare(password, this.password)
}




export const User = mongoose.model("User",schema)