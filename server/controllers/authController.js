const User = require('../models/User');
const { sendOtpEmail } = require('../utils/email');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const generateToken = (id,role) =>{
    return jwt.sign({id,role}, process.env.JWT_SECRET, {expiresIn : '7d'})
}
// reg user
exports.registerUser = async(req,res) =>{
    const {name,email,password} = req.body;

    let userExists = await User.findOne({email});
    if(userExists){
        return res.status(400).json({error : "User already exists"})
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);


    try{
        const user = await User.create({name,email,password : hashedPassword,role : 'user',isVerified : false});

        const otp = Math.floor(100000 + Math.random()*900000).toString();
        await OTP.create({
            email,otp, action : 'account_verification'
        });
        await sendOtpEmail(email,otp,'account_verification');

        res.status(201).json({
            message : 'User registered successfully , Please check your email for OTP verification',
            email : user.email
        });
    }
    catch(error){
        res.status(400).json({
            error : error.message
        })
    }
};


//login user 
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({
            message: 'Invalid credentials please sign up' 
        });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials,' });

        if (!user.isVerified && user.role !== 'admin') {
            const otp = Math.floor(100000 + Math.random()*900000).toString();
            await OTP.deleteMany({
                email, action : 'account_verification'
            });
            await OTP.create({ 
                email: user.email, otp, action: 'account_verification' 
            });
            await sendOtpEmail(user.email, otp, 'account_verification');
            return res.status(403).json({ 
                message: 'Account not verified', needsVerification: true, email: user.email 
            });
        }

        res.json({
            message : 'login successfull',
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};



//otp
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const validOTP = await OTP.findOne({ email, otp, action: 'account_verification' });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
        await OTP.deleteMany({email,action : 'account_verification'}); // Delete OTP after usage

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};