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
    const last = await linkSql.query_specify_last('ability_list', 'ability_id');
    const info = await linkSql.query_specify_data('ability_list', 'ability_id', id);
    console.log('========================');
    console.log(info);
    const length = info.length > 0;
    const data = length > 0 ? info[0] : [];
    const lastFlag = length > 0 ? info[0].ability_id === last[0].ability_id : false;
    console.log(lastFlag);
    res.render('child', { data, lastFlag });
});

module.exports = router;