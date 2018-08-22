/**
 * Created by 圆环之理 on 2018/8/4.
 *
 * 功能：主页面
 *
 */
'use strict';

const express = require('express');

import ServicesMysql from '../shared/mysql';

const router = express.Router({});
const servicesMysql = new ServicesMysql();

// 该路由使用的中间件
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});
// 定义网站主页的路由
router.get('/', function(req, res) {
    res.render('index.jade', { title: 'Express Hello', name: '赵春梅' });
});

router.get('/ability', async function(req, res) {
    let { offSet = '0', limit = '10' } = req.query;
    offSet = offSet !== 'NaN' ? offSet * 1 : 0;
    limit = limit * 1 + offSet;
    const data = await servicesMysql.query_next_until_data('ability_list', 'ability_id', offSet, limit);
    res.render('ability.jade', { data, offSet });
});

router.get('/ability/child', async function(req, res) {
    const { id } = req.query;
    const last = await servicesMysql.query_specify_last('ability_list', 'ability_id');
    const info = await servicesMysql.query_specify_data('ability_list', 'ability_id', id);
    const length = info.length > 0;
    const data = length > 0 ? info[0] : [];
    const lastFlag = length > 0 ? info[0].ability_id === last[0].ability_id : false;
    res.render('abilityChild.jade', { data, lastFlag });
});

router.get('/prop', async function(req, res) {
    let { offSet, limit } = req.query;
    offSet = offSet !== 'NaN' ? offSet * 1 : 0;
    limit = limit * 1 + offSet;
    const data = await servicesMysql.query_next_until_data('prop_list', 'prop_id', offSet, limit);
    res.render('prop.jade', { data, offSet });
});

router.get('/prop/child', async function(req, res) {
    const { id } = req.query;
    const last = await servicesMysql.query_specify_last('prop_list', 'prop_id');
    const info = await servicesMysql.query_specify_data('prop_list', 'prop_id', id);
    const length = info.length > 0;
    const data = length > 0 ? info[0] : [];
    const lastFlag = length > 0 ? info[0].prop_id === last[0].prop_id : false;
    res.render('propChild.jade', { data, lastFlag });
});

router.get('/move', async function(req, res) {
    let { offSet = '0', limit = '10' } = req.query;
    offSet = offSet !== 'NaN' ? offSet * 1 : 0;
    limit = limit * 1 + offSet;
    const data = await servicesMysql.query_next_until_data('item_list', 'item_id', offSet, limit);
    res.render('move.jade', { data, offSet });
});

router.get('/move/child', async function(req, res) {
    const { id } = req.query;
    const last = await servicesMysql.query_specify_last('item_list', 'item_id');
    const info = await servicesMysql.query_specify_data('item_list', 'item_id', id);
    const length = info.length > 0;
    const data = length > 0 ? info[0] : [];
    const lastFlag = length > 0 ? info[0].move_id === last[0].move_id : false;
    res.render('moveChild.jade', { data, lastFlag });
});

export default route => {
    route.use('/', router)
};