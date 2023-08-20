const express = require('express')
const router = express.Router()
const otpGenerator = require('otp-generator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const User = require('../Models/User')
const Otp = require('../Models/Otp')
const fetchUser = require('../Middleware/fetchUser')
const errorLooger = require('../controllers/errorLogger')

require('dotenv').config()
const env = process.env;

const jwtSecret = env.JWT_SECRET;

router.post('/create-user', [
    body('email', 'Enter a valid e-mail').isEmail(),
    body('password', 'Password must be atleast 8 characters').isLength({ min: 8 })
], async (req, res) => {

    let success = false
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation Error" })
    }

    try {

        const { email, password, name, contact, address } = req.body;

        const validateUser = await User.findOne({ email: email })

        if (validateUser) {
            return res.status(400).json({ error: "User already exists with the email." })
        }

        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt)

        const user = await User.create({
            email: email,
            password: secPass,
            name: name,
            contact: contact,
            address: address
        })

        const data = {
            user: {
                id: user.id
            }
        }

        // const authtoken = jwt.sign(data, jwtSecret)

        const validateAuthOtp = await Otp.findOne({
            userID: user.id,
            type: "auth",
            verifiedStatus: false
        })

        if (validateAuthOtp) {
            return res.status(400).json({ error: "Otp already exist" })
        }

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });

        const newOtp = Otp({
            userID: user.id,
            otp: otp,
            type: "auth"
        })

        await newOtp.save()

        success = true;
        res.json({ success, message: "Verify Email" })

    } catch (error) {
        console.log(error.message)

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        res.status(500).send({ error: "Internal Server Error" })
    }

})

router.post('/auth-user', [
    body('email', 'Enter a valid e-mail').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation Error" });
    }

    try {

        const { email, password } = req.body;

        const validateUser = await User.findOne({ email: email })

        if (!validateUser) {
            return res.status(400).json({ error: "User not found" })
        }

        let success = false

        if (!validateUser) {
            return res.status(400).json({ error: "Please try to login with correct credentials" })
        }
        const passCompare = await bcrypt.compare(password, validateUser.password);

        if (!passCompare) {
            return res.status(400).json({ error: "Please try to login with correct credentials" })
        }

        const data = {
            user: {
                id: validateUser.id
            }
        }
        const authToken = jwt.sign(data, jwtSecret)

        success = true;

        if (validateUser.isAuth) {

            res.status(200).json({ success, authToken, message: "Login Success", isAuth: validateUser.isAuth })

        } else {

            const validateAuthOtp = await Otp.findOne({
                userID: validateUser._id,
                type: "auth",
                verifiedStatus: false
            })

            if (validateAuthOtp) {
                return res.status(400).json({ error: "Otp already exist" })
            }

            const otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false
            });

            const newOtp = Otp({
                userID: validateUser._id,
                otp: otp,
                type: "auth"
            })

            await newOtp.save()

            res.status(200).json({
                success,
                message: "Please verify your email.",
                isAuth: validateUser.isAuth,
                email: validateUser.email
            })

        }


    } catch (error) {

        console.log(error)

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        res.status(500).send({ error: "Internal Server Error" })

    }

})

router.post('/auth-user/verify-email', async (req, res) => {

    try {

        const { otp, email } = req.body;

        const validateUser = await User.findOne({ email: email })

        if (!validateUser) {
            return res.status(400).json({ error: "User not found" })
        }

        const otpData = await Otp.findOne({ userID: validateUser._id, type: 'auth', verifiedStatus: false })

        if (!otpData) {
            return res.status(400).json({ error: "Otp not found" })
        }

        if (Number(otp) === otpData.otp) {

            const userData = {
                user: {
                    id: validateUser.id
                }
            }

            const authToken = jwt.sign(userData, jwtSecret)

            otpData.verifiedStatus = true

            validateUser.isAuth = true

            await validateUser.save()

            await otpData.save()

            return res.status(200).json({
                success: true,
                message: "otp verified !",
                authToken,
                type: otpData.type
            })

        }

        res.status(400).json({ error: "Otp validation failed" })

    } catch (error) {
        console.log(error)

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        res.status(500).json({ error: 'Internal Server Error' })
    }

})

router.post('/update-password', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id;

        const user = await User.findById(sessionUserID)

        if (!user) {
            return res.status(400).json({ error: "User not found." })
        }

        const { password, newPassword } = req.body;

        const verifyOldPassword = await bcrypt.compare(password, user.password)

        if (!verifyOldPassword) {
            return res.status(400).json({ error: "Invalid Credentials" })
        }

        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(newPassword, salt)

        user.password = secPass

        await user.save()

        res.status(200).json({ success: true, message: "Password Updated" })

    } catch (error) {
        console.log(error.message);

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        res.send({ error: "Internal Server Error" })
    }

})

router.post('/update-profile', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const { name, contact, address } = req.body;

        const validateUser = await User.findById(sessionUserID)

        if (!validateUser) {
            return res.status(404).json({ error: "User not found" })
        }

        const newUser = {}

        if (name) { newUser.name = name }
        if (contact) { newUser.contact = contact }
        if (address) { newUser.address = address }

        const user = await User.findByIdAndUpdate(sessionUserID, { $set: newUser }, { new: true })

        res.send({ success: true, message: "Profile Updated" })

    } catch (error) {

        console.log(error.message);

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        res.send({ error: "Internal Server Error" })

    }

})

router.post('/get-profile', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const validateUser = await User.findById(sessionUserID).select('-password')

        if (!validateUser) {
            return res.status(404).json({ error: "User Not Found" })
        }

        res.status(200).json({ success: true, user: validateUser })

    } catch (error) {
        console.log(error.message);

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        res.send({ error: "Internal Server Error" })
    }

})

module.exports = router