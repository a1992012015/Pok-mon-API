/**
 * Created by 圆环之理 on 2018/8/4.
 *
 * 功能：
 *
 */
'use strict';

const express = require("express");
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
