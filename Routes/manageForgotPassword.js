const express = require('express');
const User = require('../Models/User');
const router = express.Router()
const Otp = require('../Models/Otp')
const bcrypt = require('bcryptjs')
const otpGenerator = require('otp-generator');
const errorLooger = require('../controllers/errorLogger')

router.post('/generate-otp', async (req, res) => {

    try {

        const { email } = req.body;

        const validateUser = await User.findOne({ email: email })

        if (!validateUser) {
            return res.status(400).json({ error: "User Not Found" })
        }

        const validateAuthOtp = await Otp.findOne({
            userID: validateUser.id,
            type: 'reset',
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
            userID: validateUser.id,
            otp: otp,
            type: 'reset'
        })

        await newOtp.save()

        res.status(200).json({ success: true, message: "OTP Sent to mail" })

    } catch (error) {

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }

})

router.post('/validate-otp', async (req, res) => {

    try {

        const { otp, email } = req.body;

        const validateUser = await User.findOne({ email: email })

        if (!validateUser) {
            return res.status(400).json({ error: "User not found" })
        }

        const otpData = await Otp.findOne({ userID: validateUser._id, type: 'reset', verifiedStatus: false })

        if (!otpData) {
            return res.status(400).json({ error: "Otp not found" })
        }

        if (Number(otp) === otpData.otp) {

            otpData.verifiedStatus = true

            await otpData.save()

            return res.status(200).json({
                "success": true,
                "message": "otp verified !",
                "type": otpData.type
            })

        }

        res.status(400).json({ error: "Otp validation failed" })

    } catch (error) {

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }

})

router.post('/update-password', async (req, res) => {

    try {

        const { email, password } = req.body;

        const validateUser = await User.findOne({ email: email })

        if (!validateUser) {
            return res.status(400).json({ error: "User not found" })
        }

        const validateOtp = await Otp.findOne({ userID: validateUser._id, type: 'reset', verifiedStatus: true })

        if (!validateOtp) {
            return res.status(400).json({ error: "Otp Validation failed !" })
        }

        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt)

        await User.findByIdAndUpdate(validateUser._id, { password: secPass }, { new: true })

        res.status(200).json({
            success: true,
            message: "Password Updated Login"
        })

    } catch (error) {

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        console.log(error)
        res.status(500).json({ error: "Internal Sever Error" })
    }

})

module.exports = router;