const express = require('express')
const urlModel = require('../model/urlModel.js')

const router = express.Router()

// const Url = require('../models/urlModel.js')

// : app.get(/:code)==>end of a string
// 

// @route       GET /:code
// @description    Redirect to the long/original URL 
router.get('/:urlCode', async(req, res)=>{
    try{
        const url = await urlModel.findOne({urlCode: req.params.urlCode})
        if(url){
            return res.redirect(url.longUrl)
        }
        else{
            return res.status(404).json('No URL Found')
        }

    }
    catch(err){
        console.error(err)
        res.status(500).json('Server Error')
    }
})


module.exports = router