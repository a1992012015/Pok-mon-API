/**
 * Created by 圆环之理 on 2018/8/4.
 *
 * 功能：主页面
 *
 */
'use strict';

const express = require('express');
const router = express.Router({});

/* GET home page. */
router.get('/', async function(req, res, next) {
    res.render('index', { title: 'Express Hello', name: '赵春梅' });
});

module.exports = router;