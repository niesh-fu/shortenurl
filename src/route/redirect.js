const express = require('express')
// const urlModel = require('../model/urlModel.js')
const urlController = require('../controller/urlController')

const router = express.Router()


// router.get('/:urlCode', urlController.getUrl)
router.get('/:urlCode', urlController.getUrlRedis )

module.exports = router