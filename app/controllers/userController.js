const User = require('../models/userModel');
// const fs = require('fs').promises;
// const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();



const loadLogin = async(req,res)=>{
    try {

        res.render('login');
        
    } catch (error) {
        console.log(error.message);
    }
}

const login = async(req, res) =>{
    try {
        
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email:email });
        if(userData){
            
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if(passwordMatch){
                req.session.user = userData;
                res.redirect('/home');
            }
            else{
                res.render('login',{ message:'Email and Password is Incorrect!' });
            }
        }
        else{
            res.render('login',{ message:'Email and Password is Incorrect!' });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async(req,res) => {

    try{

        res.render('register');

    } catch (error) {
        console.log(error.message);
    }

}

const register = async (req, res) => {
    try {
        // Check if the user already exists
        const isUser = await User.findOne({ name: { $regex: req.body.name, $options: 'i' } });
        if (isUser) {
            return res.status(400).json({
                success: false,
                message: `This User Name (${req.body.name}) already exists!`
            });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        // Convert the Base64 image string back to binary data
        const imageBase64 = req.body.imageBase64;
        const imageBuffer = Buffer.from(imageBase64.split(',')[1], 'base64');

        // Create the new user object
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            image: imageBuffer,
            password: passwordHash
        });

        // Save the user to the database
        await user.save();

        // Respond with a success message
        res.status(201).json({
            success: true,
            message: 'Your Registration has been Completed!'
        });
    } catch (error) {
        console.log(error, "hello");
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};



const loadHome = async(req,res) => {

    try{

        res.render('home',{user:req.session.user,port:process.env.WS_PORT || 8000});

    } catch (error) {
        console.log(error.message);
    }

}

const logout = async(req, res) =>{
    try {

        req.session.destroy();
        res.redirect('/');
        
    } catch (error) {
        console.log(error.message);
    }
}


const getUserProfile = async (req, res) => {
    try {
        // Find the user with a case-insensitive match
        var user = await User.findOne({ name: { $regex: req.query.name, $options: 'i' } });
        
        if (user) {
            // Convert the image buffer to a base64 string if the image exists
            let base64Image = "";
            if (user.image) {
                base64Image = user.image.toString('base64');
            }

            // Send the profile data with the base64 image string
            res.send({
                success: true,
                data: {
                    name: user.name,
                    image: base64Image // base64-encoded image
                }
            });
        } else {
            res.send({ success: false, message: 'User not Found' });
        }
    } catch (error) {
        res.send({ success: false, message: 'User not Found1' });
    }
};


module.exports = {
    loadLogin,
    loadRegister,
    loadHome,
    register,
    login,
    logout,
    getUserProfile
}