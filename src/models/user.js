const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({
    username: {         
        type: String,
        required:true,    
        default: 'User' 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){  
                throw new Error('emial is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true
    },
},{
    connection: 'users'
})

const User = mongoose.model('User', userSchema)

module.exports = User