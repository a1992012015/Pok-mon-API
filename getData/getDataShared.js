/**
 * Created by 圆环之理 on 2018/8/4.
 *
 * 功能：爬虫模块共有方法
 *
 */
'use strict';

const request = require("request");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const fs = require("fs");
const os = require('os');

class GetDataShared {

    constructor() {
        this.action = 'https://wiki.52poke.com';
    };

    uuid(len, radix) {
        let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        let uuid = [];
        radix = radix || chars.length;
        if (len) {
            for (let i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            let r;
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';
            for (let i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 36;
                    uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }
        return uuid.join('');
    }

    /**
     * @method
     * @param {string} x 需要拉取的页面url
     * @param {function} cb 一个如何解析页面的函数
     * @returns {object} 解析解析完成后的数据
     * @desc 拉取页面结构和信息
     */
    startRequest(x, cb) {
        const src = `${this.action}${x}`;
        const options = {
            method: 'get',
            url: src,
            encoding: null,
            gzip: true,
        };
        // 采用http模块向服务器发起一次get请求
        return new Promise((resolve, reject) => {
            request(options, async function(err, response, body) {
                if (!err && response.statusCode === 200) {
                    // 转换编码格式
                    const html = iconv.decode(body, 'UTF-8');
                    // 解析页面
                    let $ = cheerio.load(html);
                    const data = await cb($);
                    resolve(data);
                } else {
                    console.log('get page error url => ' + err);
                    reject(err)
                }
            });
        });
    }

    /**
     * @method
     * @param {string} url 图片地址
     * @desc 把解析到的图片储存在本地
     */
    savedImg(url) {
        url = `http:${url}`;
        return new Promise((resolve, reject) => {
            request.head(url, (error, response, body) => {
                console.log(body);
                if (!error && response.statusCode === 200) {
                    const path = os.type().indexOf('Windows') !== -1 ?
                        // windows电脑
                        `C:/Users/45513/Pictures/images`
                        :
                        // linux电脑
                        `/root/public/images`;
                    // 如果没有文件夹就创建
                    if (!fs.existsSync(path)) {
                        fs.mkdirSync(path);
                    }
                    const src = `${path}/${this.uuid()}.jpg`;
                    request(url).pipe(fs.createWriteStream(src));
                    resolve(src);
                } else {
                    console.log('get img error url => ' + error);
                    reject(error)
                }
            });
        });
    }
}

module.exports = GetDataShared;