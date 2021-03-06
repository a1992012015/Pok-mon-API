/**
 * Created by 圆环之理 on 2018/8/22.
 *
 * 功能：接口路由配置页面
 *
 */
'use strict';

import express from 'express';
import ServicesMysql from '../web/mySql/mysql';
import LogInfo from '../web/util/log4jsUtil';

const router = express.Router({mergeParams: true});
const servicesMysql = new ServicesMysql();
const log = new LogInfo();

// 该路由使用的中间件
router.use(function timeLog(req, res, next) {
    log.fatal(`url:${req.path}--访问路由接口`);
    next();
});

// 定义网站主页的路由
router.get('/', function (req, res) {
    res.render('index.jade', {title: 'Express Hello', name: '赵春梅'});
});

router.get('/ability', async function (req, res) {
    let {offSet = '0', limit = '10'} = req.query;
    offSet = offSet !== 'NaN' ? offSet * 1 : 0;
    limit = limit * 1 + offSet;
    const data = await servicesMysql.query_next_until_data('ability_list', 'ability_id', offSet, limit);
    res.render('ability.jade', {data, offSet});
});

router.get('/ability/child', async function (req, res) {
    const {id} = req.query;
    const last = await servicesMysql.query_specify_last('ability_list', 'ability_id');
    const info = await servicesMysql.query_specify_data('ability_list', 'ability_id', id);
    const length = info.length;
    const data = length > 0 ? info[0] : [];
    const lastFlag = length > 0 ? info[0].ability_id === last[0].ability_id : false;
    res.render('abilityChild.jade', {data, lastFlag});
});

router.get('/prop', async function (req, res) {
    let {offSet, limit} = req.query;
    offSet = offSet !== 'NaN' ? offSet * 1 : 0;
    limit = limit * 1 + offSet;
    const data = await servicesMysql.query_next_until_data('prop_list', 'prop_id', offSet, limit);
    res.render('prop.jade', {data, offSet});
});

router.get('/prop/child', async function (req, res) {
    const {id} = req.query;
    const last = await servicesMysql.query_specify_last('prop_list', 'prop_id');
    const info = await servicesMysql.query_specify_data('prop_list', 'prop_id', id);
    const length = info.length;
    const data = length > 0 ? info[0] : [];
    const lastFlag = length > 0 ? info[0].prop_id === last[0].prop_id : false;
    res.render('propChild.jade', {data, lastFlag});
});

router.get('/move', async function (req, res) {
    let {offSet = '0', limit = '10'} = req.query;
    offSet = offSet !== 'NaN' ? offSet * 1 : 0;
    limit = limit * 1 + offSet;
    if (offSet === 0) {
        limit = 10;
    }
    const data = await servicesMysql.query_next_until_data('item_list', 'item_id', offSet, limit);
    const last = await servicesMysql.query_specify_last('item_list', 'item_id');
    const lastFlag = data[data.length - 1].item_id === last[0].item_id;
    res.render('move.jade', {data, offSet, lastFlag});
});

router.get('/move/child', async function (req, res) {
    const {id} = req.query;
    const last = await servicesMysql.query_specify_last('item_list', 'item_id');
    const info = await servicesMysql.query_specify_data('item_list', 'item_id', id);
    const length = info.length;
    const data = length > 0 ? info[0] : [];
    const lastFlag = info[0].item_id === last[0].item_id;
    res.render('moveChild.jade', {data, lastFlag});
});

export default router;