const express = require('express')
require('./db/mongoose')
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('./models/user')

const app = express()
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

app.use(express.json())    

//Verify token in Homepage
app.post('/api/home', (req, res) => {
    const { token } = req.body
    const user = jwt.verify(token, process.env.JWT_SECRET)

    if(user){
        return res.json({ status: 'ok' })
    }
    res.json({ status: 'error', error: 'Token Invalid '})
})

//Login Page
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email }).lean()

    if(!user) {
        return res.json({ status: 'error', error: 'Invalid username/password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    
    if(isMatch) {
        console.log('here')
        const token = jwt.sign({
            id: user._id,
            email: user.email 
        }, process.env.JWT_SECRET)
        
        return res.json({ status: 'ok', data: token })
    } 
    
    res.json({ status: 'error', error: 'Invalid username/password' })
})

//Signup
app.post('/api/register', async(req, res) => {

    const { username, email, password: plainTextPassword } = req.body

    if(!username || !plainTextPassword || !email){
        return res.json({ status: 'error', error: 'All fields required' })
    }

    const password = await bcrypt.hash(plainTextPassword, 10)

    try{
        const response = await User.create({
            username, 
            email, 
            password
        })
        console.log('success', response)
    } catch(error) {
        //Code for duplicate 
        if(error.code === 11000) {
            return res.json({status: 'error', error: 'Email already in exist' })
        }
        throw error
    }

    res.json({status: 'ok'})
})

app.listen(port, () => {
    console.log('Server is up on port '+ port)
})
