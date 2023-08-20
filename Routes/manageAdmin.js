const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Admin = require("../models/Admin")
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetchAdmin = require('../middleware/fetchAdmin')


require('dotenv').config()
const env = process.env;

jwtSecret = env.JWT_SECRET_ADMIN;
adminControllPassword = adminControllPassword.JWT_SECRET_ADMIN


// ROUTE 1: create a Admin using : POST '/api/auth/Admin/createAdmin' Doesn't require auth

router.post('/create', [

    body('email', 'Enter a valid e-mail').isEmail(),
    body('password', 'Password must be atleast 8 characters').isLength({ min: 8 }),

], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ error: `${errors.array()}` });
    }

    if (req.password !== req.authPassword) {
        return res.status(400).json({ error: 'You are not authorized.' });
    }

    try {

        let admin = await Admin.findOne({ email: req.body.email });
        if (admin) {
            return res.status(400).json({ error: "Sorry a Admin with this email already exists" });
        }
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(req.body.password, salt);

        // create a new admin
        admin = await Admin.create({
            email: req.body.email,
            password: secPass
        })
        const data = {
            admin: {
                id: admin.id
            }
        }
        const authtoken = jwt.sign(data, jwtSecret)

        // res.json(Admin)
        res.json({ success: true, message: "Admin Created" })

    } catch (errors) {
        console.error(errors.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 2 : Authenticate a Admin using : POST '/api/auth/Admin/authAdmin' Require auth

router.post('/auth', [
    body('email', 'Enter a valid e-mail').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: `${errors.array()}` });
    }

    const { email, password } = req.body;
    try {
        let admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ error: "Please try to login with correct credentials" })
        }
        const passCompare = await bcrypt.compare(password, admin.password);
        if (!passCompare) {
            return res.status(400).json({ error: "Please try to login with correct credentials" })
        }
        const data = {
            admin: {
                id: admin.id
            }
        }
        const authtoken = jwt.sign(data, jwtSecret)
        res.json({ authtoken })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router