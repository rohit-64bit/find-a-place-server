const express = require('express')
const router = express.Router()
const errorLooger = require('../controllers/errorLogger')
const fetchAdmin = require('../Middleware/fetchAdmin')
const PropertyType = require('../Models/PropertyType')

router.post('/create', fetchAdmin, async (req, res) => {

    try {

        const { typeName, typeDescription } = req.body;

        const data = await PropertyType({ type: typeName, description: typeDescription })

        await data.save()

        res.status(200).json({ success: true, message: "Property Type Added" })

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

router.post('/update/:id', fetchAdmin, async (req, res) => {

    try {

        const typeID = req.params.id

        const { type, description } = req.body;

        const validateType = await PropertyType.findById(typeID)

        const newData = {}

        if (type) { newData.type = type }
        if (description) { newData.description = description }

        await PropertyType.findByIdAndUpdate(typeID, { $set: newData }, { new: true })

        res.status(200).json({ success: true, message: "Updated" })

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

router.get('/fetch-data/:id', async (req, res) => {

    try {

        const typeID = req.params.id

        const data = await PropertyType.findById(typeID)

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

router.delete('/delete/:id', fetchAdmin, async (req, res) => {

    try {

        const validateProperty = await PropertyType.findById(req.params.id)

        if (!validateProperty) {
            return res.json({ error: "Property Type Not Found" })
        }

        await PropertyType.findByIdAndDelete(req.params.id)

        res.status(200).json({ success: true, message: "Deleted Successfully" })

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

router.get('/fetch', async (req, res) => {

    try {

        const data = await PropertyType.find().sort({ _id: -1 })

        res.status(200).json({ success: true, propertyType: data })

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