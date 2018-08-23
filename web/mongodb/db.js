/**
 * Created by 圆环之理 on 2018/8/23.
 *
 * 功能：连接数据库
 *
 */
'use strict';

import mongoose from 'mongoose';
import config from 'config-lite'; //获取基本信息
import log from '../util/log4jsUtil'; //自定义日志文件，后面我们将会说明

mongoose.connect(config.url,{server:{auto_reconnect: true}}).then(res => {
    console.log(res);
});

mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.once('open',() => {
    console.log('======mongoDB数据库连接成功======');
    log.info('mongoDB数据库连接成功.端口号：' + config.port); //自定义日志存储
});

db.on('error',function (error) {
    console.error('mongoDB数据库连接错误：' + error);
    log.debug('mongoDB数据库连接成功.' + error); //自定义日志存储
    mongoose.disconnect().then(res => {
        console.log(res);
    });
});

db.on('close',function () {
    console.log('mongoDB数据库断开，请重新连接.');
    log.trace('mongoDB数据库断开，请重新连接.');
    mongoose.connect(config.url, {server:{auto_reconnect:true}}).then(res => {
        console.log(res);
    });
});

export default db;