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

const Mysql = require('../shared/mysql');

module.exports = class GetDataShared extends Mysql {

    constructor() {
        super();
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
     * @returns {object} 解析解析完成后的数据
     * @desc 拉取页面结构和信息
     */
    startRequest(x) {
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
                    const $ = cheerio.load(html);
                    resolve($);
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
     * @param {string} name 图片名称
     * @desc 把解析到的图片储存在本地
     */
    savedImg(url, name) {
        return new Promise((resolve, reject) => {
            request.head(url, (error, response) => {
                if (!error && response.statusCode === 200) {
                    const path = os.type().indexOf('Windows') !== -1 ?
                        // windows电脑
                        `C:/Users/45513/Pictures/images`
                        :
                        // linux电脑
                        `/home/ftpuser/www/pokemon/prop`;
                    // 如果没有文件夹就创建
                    if (!fs.existsSync(path)) {
                        fs.mkdirSync(path);
                    }
                    name = `${name}${url.slice(url.lastIndexOf('.'), url.length)}`;
                    const src = `${path}/${name}`;
                    request(url).pipe(fs.createWriteStream(src));
                    const mySqlImg = `/pokemon/prop/${name}`;
                    resolve(mySqlImg);
                } else {
                    console.log('get img error url => ' + error);
                    reject(error)
                }
            });
        });
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {String} tag 需要解析的标签名字
     * @param {String} text 需要查询的内容
     * @returns {string} 子级页面选取的数据
     * @desc 给定查询的标签和查询的字符串确定截取范围和空间
     */
    defineAddress($, tag, text) {
        const title = $(tag);
        let startIndex;
        let endIndex;
        for (let i = 0; i < title.length; i++) {
            const battle = title.eq(i).text().trim().toString();
            if (battle === text) {
                startIndex = i;
                endIndex = i + 1;
            }
        }
        const html = title.eq(startIndex).nextUntil(title.eq(endIndex));
        let outerHTML = '';
        for (let i = 0; i < html.length; i++) {
            outerHTML += this.analysisHtml($, html.eq(i));
        }
        return outerHTML;
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} html 截取到的html结构
     * @returns {jQuery} 处理完毕的html字符串
     * @desc 处理截取到的html结构里面多余的标签和类名id
     */
    analysisHtml($, html) {
        if ($(html).prop('tagName') === 'UL') {
            const htmlUl = $(html).find('li');
            for (let i = 0; i < htmlUl.length; i++) {
                const content = $(htmlUl[i]).text().trim();
                $(htmlUl[i]).html(content);
            }
        } else {
            const content = $(html).text().trim();
            $(html).html(content);
        }
        return $(html).html($(html)).html();
    }

    /**
     * @method
     * @param {Object} abilityList 每一条数据
     * @param {Array} param 需要排序成的数组
     * @returns {Array} 可以插入数据的结构顺序
     * @desc 将获取到的对象数据转换成可插入数据库的数组
     */
    setParam(abilityList, param) {
        param = param.map((item) => {
            return abilityList[item];
        });
        return param;
    }

    /**
     * @method
     * @param {string} name 属性名称
     * @returns {number || string} 返回名称对应的flag || 或者未知属性
     * @desc 根据名字获取数据的flag
     */
    type(name) {
        switch (name) {
            case '一般':
                return 0;
            case '火':
                return 1;
            case '虫':
                return 2;
            case '水':
                return 3;
            case '毒':
                return 4;
            case '电':
                return 5;
            case '飞行':
                return 6;
            case '草':
                return 7;
            case '地面':
                return 8;
            case '冰':
                return 9;
            case '格斗':
                return 10;
            case '超能力':
                return 11;
            case '岩石':
                return 12;
            case '幽灵':
                return 13;
            case '龙':
                return 14;
            case '恶':
                return 15;
            case '钢':
                return 16;
            case '妖精':
                return 17;
            default:
                return '???';
        }
    }

    /**
     * @method
     * @param {string} name 招数伤害类型
     * @returns {number} 返回上海类型对应的flag
     * @desc 根据名字获取数据的flag
     */
    damage(name) {
        switch (name) {
            case '物理':
                return 0;
            case '特殊':
                return 1;
            default:
                return 2;
        }
    }
};