/**
 * Created by 圆环之理 on 2018/8/4.
 *
 * 功能：项目入口
 *
 */
'use strict';

import express from 'express';
import db from './web/mySql/db.js'
import config from 'config-lite';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectMysql from 'connect-mysql'; //该模块用于将session存入mongo中
import winston from 'winston'; //日志
import expressWinston from 'express-winston'; //日志中间插件
import path from 'path';
import history from 'connect-history-api-fallback'; //就是让你的单页面路由处理更自然（比如vue-router的mode设置为html5时）参考地址：https://github.com/bripkens/connect-history-api-fallback
import Statistic from './web/middlewares/statistic';
import router from './routes';
import getData from './web/models/getData';

const defaultConfig = config(__dirname);

// 爬取数据
getData();

const app = express();

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true'); //可以带Cookies
    res.header('X-Powered-By', '3.2.1');
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});

app.use(Statistic.apiRecord);
const MysqlStore = connectMysql(session);
app.use(cookieParser()); //cookie运用

//session运用
app.use(session({
    name: defaultConfig.session.name,
    secret: defaultConfig.session.secret,
    resave: true,
    saveUninitialized: false,
    cookie: defaultConfig.session.cookie,
    store: new MysqlStore(defaultConfig.options) // new MysqlStore({url: defaultConfig.url})
}));

//正确日志
app.use(expressWinston.logger({
    transports: [
        new (winston.transports.Console)({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: `logs/${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-success.log` // 根据日期生成日志成功文件
        })
    ]
}));

router(app);

//错误日志
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: `logs/${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-error.log` // 根据日期生成日志错误文件
        })
    ]
}));

app.use(history());
app.use(express.static('./public'));
app.use((req, res, next) => {
    res.status(404).render('404.jade');
    next();
});

module.exports = app;