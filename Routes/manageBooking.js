const express = require('express');
const Property = require('../Models/Property');
const Booking = require('../Models/Booking');
const router = express.Router()
const fetchUser = require('../Middleware/fetchUser')

router.post('/check-availability', async (req, res) => {

    try {

        const { propertyID, startDate, endDate } = req.body;

        const validateProperty = await Booking.find({
            propertyID: propertyID,
            startDate: { $lt: endDate },
            endDate: { $gt: startDate }
        })

        if (validateProperty) {
            return res.status(200).json({
                success: true,
                available: false,
                message: "Unavailable"
            })
        }

        res.status(200).json({
            success: true,
            available: true,
            message: "Available"
        })

    } catch (error) {

    }

})

router.post('/create-booking', fetchUser, async (req, res) => {

    try {

        const { propertyID, startDate, endDate, userID } = req.body;

        const validateProperty = await Booking.find({
            propertyID: propertyID,
            startDate: { $lt: endDate },
            endDate: { $gt: startDate }
        })

        if (validateProperty) {
            return res.status(200).json({
                success: true,
                available: false,
                message: "Unavailable"
            })
        }

        const data = await Booking({
            propertyID,
            userID,
            startDate,
            endDate
        })

        await data.save()

        res.status(200).json({
            success: true,
            message: "Booking Created"
        })

    } catch (error) {

    }

})

router.post('/cancel-booking', fetchUser, async (req, res) => {

    try {

        const { bookingID } = req.body

        const validateBooking = await Booking.findById(bookingID)

        if (!validateBooking) {
            return res.status(200).json({ error: "Invalid Booking ID" })
        }

        validateBooking.isCanceled = true

        await validateBooking.save()

        res.status(200).json({ success: true, message: "Booking Canceled" })

    } catch (error) {

    }

})

router.post('/fetch', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const data = await Booking.find({ userID: sessionUserID }).sort({ _id: -1 })

        res.status(200).json({ success: true, data })

    } catch (error) {

    }

})

module.exports = router