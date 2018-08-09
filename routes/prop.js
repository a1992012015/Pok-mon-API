/**
 * Created by 圆环之理 on 2018/8/9.
 *
 * 功能：道具列表路由
 *
 */
'use strict';

const express = require('express');
const router = express.Router();
const mysql = require('../shared/mysql');

const linkSql = new mysql();

router.get('/', async function(req, res, next) {
    const data = await linkSql.query_data('prop_list');
    res.render('prop', { data });
});

router.get('/child', async function(req, res, next) {
    const { id } = req.query;
    const last = await linkSql.query_specify_last('prop_list', 'prop_id');
    const info = await linkSql.query_specify_data('prop_list', 'prop_id', id);
    const length = info.length > 0;
    const data = length > 0 ? info[0] : [];
    const lastFlag = length > 0 ? info[0].prop_id === last[0].prop_id : false;
    res.render('propChild', { data, lastFlag });
});

module.exports = router;