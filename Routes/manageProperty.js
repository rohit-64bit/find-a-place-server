const express = require('express')
const router = express.Router()
const fetchUser = require('../Middleware/fetchUser')
const Property = require('../Models/Property')
const errorLooger = require('../controllers/errorLogger')

router.post('/create-property', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const { title, description, location, cost, images, type, contact, typeName } = req.body;

        const data = Property({
            title,
            description,
            location,
            cost,
            images,
            type,
            contact,
            owner: sessionUserID,
            typeName
        })

        await data.save()

        res.status(200).json({ success: true, message: 'Property Added' })

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

router.get('/fetch-top-property', async (req, res) => {

    try {

        const data = await Property.find({ RatingScore: { $gt: 4 } }).sort({ _id: -1 })

        res.status(200).json({
            success: true,
            data
        })

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

router.get('/fetch-property', async (req, res) => {

    try {

        const data = await Property.find({ RatingScore: { $gt: 3 } }).sort({ _id: -1 })

        res.status(200).json({
            success: true,
            data
        })

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

router.post('/search/:query', async (req, res) => {

    try {

        const query = req.params.query

        const searchRegex = new RegExp(query, "i");

        const data = await Property.find({
            $or: [
                { location: searchRegex },
                { typeName: searchRegex }
            ]
        }).sort({ _id: -1 })

        res.status(200).json({ success: true, data })

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

router.post('/update-property', fetchUser, async (req, res) => {

    try {



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

router.post('/delete-property', fetchUser, async (req, res) => {

    try {

        const sessionUserID = req.user.id

        const { propertyID } = req.body;

        const property = await Property.find({ _id: propertyID, owner: sessionUserID })

        if (!property) {

            return res.status(200).json({ error: 'Authorization Error' })

        }

        await Property.findOneAndDelete({ _id: propertyID, owner: sessionUserID })

        res.status(200).json({ success: true, message: 'Property Deleted' })

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

module.exports = router;