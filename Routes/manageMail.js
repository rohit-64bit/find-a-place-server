const express = require('express');
const router = express.Router()

const errorLooger = require('../controllers/errorLogger');
const client = require('../controllers/mailClient');
const User = require('../Models/User');
const Contact = require('../Models/Contact');


require('dotenv').config()
const env = process.env;

router.post('/contact', async (req, res) => {

  try {

    const { email, name, message, type, subject } = req.body

    console.log(req.body)

    const validateUser = await User.findOne({ email: email })

    if (validateUser) {

      const contactData = await Contact({
        email: validateUser.email,
        name: validateUser.name,
        message: message,
        type: type,
        subject: subject,
        isExistingUser: true
      })

      await contactData.save()



      client.sendMail(
        {
          from: env.MAIL,
          to: validateUser.email,
          subject: `Thankyou for contacting us.`,
          html: `
          <html>
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
                Hey! ${validateUser.name} thankyou for contacting us.</td>
            </tr>
            <tr>
      <td style="padding: 2rem;">
        <p style="font-size: 1rem;">Thankyou for contacting us our support team will contact you very soon.</p>
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
        .catch(e => {
          console.log(e)
        })

      res.status(200).json({ success: true, message: "Mail Sent" })

    } else {

      const contactData = await Contact({
        email: email,
        name: name,
        message: message,
        type: type,
        subject: subject,
        isExistingUser: false
      })

      client.sendMail(
        {
          from: env.MAIL,
          to: email,
          subject: `Thankyou for contacting us.`,
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
                Hey! ${name} welcome 👋</td>
            </tr>
            <tr>
              <td style="padding: 2rem;">
                <p style="font-size: 1rem;">Thankyou for contacting us our support team will contact you soon.</p>
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
        .catch(e => {
          console.log(e)
        })

      await contactData.save()

      res.status(200).json({ success: true, message: "Mail Sent" })

    }

  } catch (error) {

    console.error(error.message)

    const errorData = {
      path: `${req.baseUrl + req.url}`,
      errorMessage: error.message,
      errorDetails: error
    }
    errorLooger(errorData)
    res.status(500).json({ error: "Internal Sever Error" })

  }

})

module.exports = router