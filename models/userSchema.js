import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    }, tokens : [
        {
            token : {
                type : String,
                required : true
            }
        }
    ]
})

userSchema.pre('save', async function (next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 12)
    }
    next();
})

const User = mongoose.model('USER', userSchema);

export default User