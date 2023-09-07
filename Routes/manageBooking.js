const express = require('express');
const router = express.Router()
const Property = require('../Models/Property');
const Booking = require('../Models/Booking');
const fetchUser = require('../Middleware/fetchUser');
const errorLooger = require('../controllers/errorLogger');

router.post('/check-availability', async (req, res) => {

    try {

        const { propertyID, startDate, endDate } = req.body;

        const validateBooking = await Booking.findOne({
            propertyID: propertyID,
            startDate: { $lt: endDate },
            endDate: { $gt: startDate }
        })

        if (!validateBooking) {
            res.status(200).json({
                success: true,
                available: true,
                message: "Available"
            })
        } else {
            return res.status(200).json({
                success: true,
                available: false,
                message: "Property unavailable"
            })
        }


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

router.post('/create-booking', fetchUser, async (req, res) => {

    try {

        const { propertyID, startDate, endDate, userID } = req.body;

        const sessionUserID = req.user.id

        const validateBooking = await Booking.findOne({
            propertyID: propertyID,
            startDate: { $lt: endDate },
            endDate: { $gt: startDate }
        })

        if (!validateBooking) {

            const data = await Booking({
                propertyID,
                userID: sessionUserID,
                startDate,
                endDate
            })

            await data.save()

            res.status(200).json({
                success: true,
                available: true,
                message: "Booking Created"
            })

        } else {

            return res.status(200).json({
                success: true,
                available: false,
                message: "Property unavailable"
            })

        }

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

router.post('/cancel-booking', fetchUser, async (req, res) => {

    try {

        const { bookingID } = req.body

        const validateBooking = await Booking.findById(bookingID)

        if (!validateBooking) {
            return res.status(200).json({ error: "Invalid Booking ID" })
        }

        validateBooking.isCanceled = true
        validateBooking.status = "cancelled"

        await validateBooking.save()

        res.status(200).json({ success: true, message: "Booking Canceled" })

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

router.post('/fetch', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const data = await Booking.find({ userID: sessionUserID }).sort({ _id: -1 })

        res.status(200).json({ success: true, data })

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

// exclusive apis for property owners

router.post('/fetch-bookings', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const property = await Property.find({ owner: sessionUserID })

        const propertyID = property.map(data => data._id)

        const data = await Booking.find({ propertyID: { $in: propertyID } }).sort({ _id: -1 })

        const newData = await Booking.find({ status: 'new' }).sort({ _id: -1 })

        res.status(200).json({

            success: true,
            data: data,
            newData: newData.length
            
        })

    } catch (error) {

        console.log(error)

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }
        errorLooger(errorData)
        res.status(500).json({ error: "Internal Sever Error" })

    }

})

router.post('/update', fetchUser, async (req, res) => {

    try {

        const validateBooking = await Booking.findById(req.body.bookingID)

        if (!validateBooking) {
            return res.status(200).json({ error: "Invalid Booking" })
        }

        validateBooking.status = req.body.status

        await validateBooking.save()

        res.status(200).json({
            success: true,
            message: "Status Updated"
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

module.exports = router