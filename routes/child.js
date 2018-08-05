/**
 * Created by 圆环之理 on 2018/8/5.
 *
 * 功能：子级页面
 *
 */
'use strict';

const express = require('express');
const router = express.Router();
const mysql = require('../shared/mysql');

const linkSql = new mysql();

router.get('/', async function(req, res, next) {
    const { id } = req.query;
    const data = await linkSql.query_specify_data('ability_list', 'ability_id', id);
    if (data && data[0].in_tips) {
        data[0].in_tips = JSON.parse(data[0].in_tips);
    }
    if (data && data[0].out_tips) {
        data[0].out_tips = JSON.parse(data[0].out_tips);
    }
    res.render('child', { data: data ? data[0] : [] });
});

module.exports = router;