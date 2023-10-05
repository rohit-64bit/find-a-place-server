const nodemailer = require('nodemailer')
require('dotenv').config()

const env = process.env;

const client = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: env.MAIL,
        pass: env.MAIL_SECRET
    }
});


module.exports = client