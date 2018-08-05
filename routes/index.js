/**
 * Created by 圆环之理 on 2018/8/4.
 *
 * 功能：主页面
 *
 */
'use strict';

const express = require('express');
const router = express.Router();
const mysql = require('../shared/mysql');

const linkSql = new mysql();

/* GET home page. */
router.get('/', async function(req, res, next) {
    const data = await linkSql.query_data('ability_list');
    res.render('index', { title: 'Express Hello', name: '赵春梅', data: data ? data : [] });
});

module.exports = router;