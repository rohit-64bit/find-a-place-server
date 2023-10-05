const express = require('express');
const User = require('../Models/User');
const router = express.Router()
const Otp = require('../Models/Otp')
const bcrypt = require('bcryptjs')
const otpGenerator = require('otp-generator');
const errorLooger = require('../controllers/errorLogger')
const nodemailer = require('nodemailer');
const client = require('../controllers/mailClient');

require('dotenv').config()

const env = process.env;

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

        client.sendMail(
            {
                from: env.MAIL,
                to: email,
                subject: `Hey ${validateUser.name} reset your password!`,
                html: `<html>
            
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: Arial, sans-serif;
                  font-size: 16px;
                  color: #333;
                  background-color: #f7f7f7;
                  padding: 20px;
                  margin: 0;
                  width: 100%;
                }
              </style>
            </head>
            
            <body>
              <table style="width: 100%; max-width: 600px; margin: 0 auto;">
                <tr>
                  <td
                    style="background-color: #000000; color: #ffffff; font-size: 2rem; font-weight: bold; padding: 2rem; text-align: center;">
                    hey! ${validateUser.name}</td>
                </tr>
                <tr>
                  <td style="padding: 2rem;">
                    <p style="font-size: 1rem;">Reset your account password by using this OTP if you think that this is note done by
                      you than you should secure your account.</p>
                    <div style="margin-top: 2rem;">
                      <div style="font-size: 0.8rem;">To reset your password please use this OTP</div>
                      <div style="font-size: 3rem; font-weight: bold; text-align: center;">${otp}</div>
                    </div>
                    <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 2rem;">
                      <p>Thanks &amp; Regards</p>
                      <p><a href=${env.CLIENT_URL}
                          style="font-weight: bold; color: #000000; text-decoration: none; border-bottom: 1px solid #6b7280; display: inline-block;">${env.CLIENT_URL}</a>
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #d1d5db; padding: 1rem; text-align: center;">
                    <a href=${env.CLIENT_URL}
                      style="font-weight: bold; opacity: 0.8; transition: opacity 0.3s ease-in-out; color: #000000; text-decoration: none; border-bottom: 2px solid #6b7280;">${env.CLIENT_URL}</a>
                  </td>
                </tr>
              </table>
            </body>
            
            </html>`
            }
        )

        res.status(200).json({ success: true, message: "OTP Sent to mail" })

    } catch (error) {

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        console.error(error.message)
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

        console.error(error.message)
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

        client.sendMail(
            {
                from: env.MAIL,
                to: email,
                subject: `Hey ${validateUser.name} reset your password!`,
                html: `<html>
            
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: Arial, sans-serif;
                  font-size: 16px;
                  color: #333;
                  background-color: #f7f7f7;
                  padding: 20px;
                  margin: 0;
                  width: 100%;
                }
              </style>
            </head>
            
            <body>
              <table style="width: 100%; max-width: 600px; margin: 0 auto;">
                <tr>
                  <td
                    style="background-color: #000000; color: #ffffff; font-size: 2rem; font-weight: bold; padding: 2rem; text-align: center;">
                    hey! ${validateUser.name}</td>
                </tr>
                <tr>
                  <td style="padding: 2rem;">
                    <p style="font-size: 1rem;">Password is succesfully changed for your account ✨.</p>
                    <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 2rem;">
                      <p>Thanks &amp; Regards</p>
                      <p><a href=${env.CLIENT_URL}
                          style="font-weight: bold; color: #000000; text-decoration: none; border-bottom: 1px solid #6b7280; display: inline-block;">${env.CLIENT_URL}</a>
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #d1d5db; padding: 1rem; text-align: center;">
                    <a href=${env.CLIENT_URL}
                      style="font-weight: bold; opacity: 0.8; transition: opacity 0.3s ease-in-out; color: #000000; text-decoration: none; border-bottom: 2px solid #6b7280;">${env.CLIENT_URL}</a>
                  </td>
                </tr>
              </table>
            </body>
            
            </html>`
            }
        )

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

        console.error(error.message)
        res.status(500).json({ error: "Internal Sever Error" })
    }

})

module.exports = router;