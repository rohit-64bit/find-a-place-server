const express = require('express');
const router = express.Router();
const Property = require('../Models/Property')
const Booking = require('../Models/Booking')
const Review = require('../Models/Review')
const fetchUser = require('../Middleware/fetchUser');

const errorLooger = require('../controllers/errorLogger');

router.post('/create', fetchUser, async (req, res) => {

    try {

        const { bookingID, rating, comment, description } = req.body;

        const sessionUserID = req.user.id;

        const validateReview = await Review.findOne({ userID: sessionUserID, bookingID: bookingID })

        const validateBooking = await Booking.findById(bookingID);

        const validateProperty = await Property.findById(validateBooking.propertyID)

        if (!validateProperty) {
            return res.status(400).json({
                error: 'Property not found'
            })
        }

        if (!validateBooking) {
            return res.status(400).json({
                error: 'Booking not found'
            })
        }

        if (validateReview) {
            return res.status(400).json({
                error: 'You have already reviewed this property'
            })
        }

        if (validateBooking.userID == sessionUserID) {

            validateProperty.totalReviews = validateProperty.totalReviews + 1
            validateProperty.RatingScore = validateProperty.RatingScore + rating

            await validateProperty.save();

            const data = await Review({
                userID: sessionUserID,
                propertyID: validateBooking.propertyID,
                bookingID: bookingID,
                rating: Number(rating),
                comment: comment,
                description: description
            })

            await data.save()

            return res.status(200).json({

                success: true,
                message: 'Review added'

            })

        }

    } catch (error) {

        console.error(error.message);

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        res.status(500).json({ error: "Internal Server Error" })

    }

});

router.get('/fetch/:propertyID', async (req, res) => {

    try {

        const { propertyID } = req.params

        const data = await Review.find({ propertyID: propertyID }).sort({ _id: -1 })

        res.status(200).json({
            success: true,
            data: data
        })

    } catch (error) {

        console.error(error.message);

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        res.status(500).json({ error: "Internal Server Error" })

    }

})

router.delete('/delete-review/:reviewID', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const data = await Review.findOne({ userID: sessionUserID, _id: req.params.reviewID })

        if (!data) {
            return res.status(400).json({
                error: 'Review not found'
            })
        }

        await Review.findByIdAndDelete(req.params.reviewID)

        res.status(200).json({
            success: true,
            message: 'Review deleted'
        })

    } catch (error) {

        console.error(error.message);

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        res.status(500).json({ error: "Internal Server Error" })

    }

})

router.post('/fetch-all-feedback', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const property = await Property.find({ owner: sessionUserID })

        const propertyID = property.map(data => data._id)

        const data = await Review.find({ propertyID: { $in: propertyID } })

        res.status(200).json({
            success: true,
            data: data
        })

    } catch (error) {

        console.error(error.message);

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        res.status(500).json({ error: "Internal Server Error" })

    }

})

router.post('/reply/:reviewID', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const { review } = req.body

        const validateReview = await Review.findById(req.params.reviewID)

        if (!validateReview) {
            return res.status(400).json({
                error: 'Review not found'
            })
        }

        const validateProperty = await Property.findById(validateReview.propertyID)

        if (!validateProperty) {
            return res.status(400).json({
                error: 'Property not found'
            })
        }

        if (validateProperty.owner === sessionUserID) {

            validateReview.reviewText = review

            await validateReview.save()

            return res.status(200).json({
                success: true,
                message: 'Reply added'
            })

        } else {

            return res.status(400).json({
                error: 'You are not the owner of this property'
            })

        }

    } catch (error) {

        console.error(error.message);

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        res.status(500).json({ error: "Internal Server Error" })

    }

})

router.get('/fetch-all', async (req, res) => {

    try {

        const data = await Review.find({ rating: { $gt: 3.5 } })

        res.status(200).json({
            success: true,
            data: data.slice(0, 4)
        })

    } catch (error) {

        console.error(error.message);

        const errorData = {
            path: `${req.baseUrl + req.url}`,
            errorMessage: error.message,
            errorDetails: error
        }

        errorLooger(errorData)

        res.status(500).json({ error: "Internal Server Error" })

    }

})

module.exports = router;