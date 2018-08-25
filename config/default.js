/**
 * Created by 圆环之理 on 2018/8/22.
 *
 * 功能：默认配置文件
 *
 */
'use strict';

module.exports = {
    port: 3000,
    mongodbPort: 27017,
    url: 'mongodb://119.27.168.74:27017/Pokemon',
    sessions: {
        name: 'SID',
        secret: 'SID',
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 365 * 24 * 60 * 60 * 1000,
        }
    },
    mySqlLink: {
        config: {
            host: '119.27.168.74',
            user: 'root',
            password: 'mengyehuanyu123.',
            port: '3306',
            database: 'pokemon',
        }
    },
    urlAbility: '/wiki/%E7%89%B9%E6%80%A7%E5%88%97%E8%A1%A8',
    urlItem: '/wiki/%E6%8B%9B%E5%BC%8F%E5%88%97%E8%A1%A8',
    urlProp: '/wiki/%E9%81%93%E5%85%B7%E5%88%97%E8%A1%A8%EF%BC%88%E4%B8%BB%E7%B3%BB%E5%88%97%EF%BC%89',
    urlIllustrations: '/wiki/%E5%AE%9D%E5%8F%AF%E6%A2%A6%E5%88%97%E8%A1%A8%EF%BC%88%E6%8C%89%E5%85%A8%E5%9B%BD%E5%9B%BE%E9%89%B4%E7%BC%96%E5%8F%B7%EF%BC%89/%E7%AE%80%E5%8D%95%E7%89%88'
};