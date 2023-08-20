const express = require('express')
import Property from './../../client/src/pages/Property';
const router = express.Router()
const errorLooger = require('../controllers/errorLogger')
const fetchAdmin = require('../Middleware/fetchAdmin')
const PropertyType = require('../Models/PropertyType')

router.post('/create', fetchAdmin, async (req, res) => {

    try {

        const { typeName, typeDescription } = req.body;

        const data = await PropertyType({ typeName, typeDescription })

        await data.save()

        res.status(200).json({ success: true, message: "Property Type Added" })

    } catch (error) {

        console.log(error.message);

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

        res.status(200).json({success:true,message:"Deleted Successfully"})

    } catch (error) {
        console.log(error.message);

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

        const data = await PropertyType.find()

        res.status(200).json({ propertyType: data })

    } catch (error) {

        console.log(error.message);

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