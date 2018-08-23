/**
 * Created by 圆环之理 on 2018/8/22.
 *
 * 功能：默认配置文件
 *
 */
'use strict';

module.exports = {
    port: 27017,
    url: '119.27.168.74',
    session: {
        name: 'SID',
        secret: 'SID',
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 365 * 24 * 60 * 60 * 1000,
        }
    },
    mySqlLink: {
        host: '119.27.168.74',
        user: 'root',
        password: 'mengyehuanyu123.',
        port: '3306',
        database: 'pokemon',
    },
    options: {
        config: {
            host: '119.27.168.74',
            user: 'root',
            password: 'mengyehuanyu123.',
            database: 'pokemon',
        }
    }
};