/**
 * Created by 圆环之理 on 2018/8/4.
 *
 * 功能：爬取道具列表
 *
 */
'use strict';

const fs = require("fs");
const path = require("path");

const GetDataShared = require('./getDataShared');
const Mysql = require('../shared/mysql');

const linkSql = new Mysql();
const getDataShared = new GetDataShared();
const url = '/wiki/%E9%81%93%E5%85%B7%E5%88%97%E8%A1%A8%EF%BC%88%E4%B8%BB%E7%B3%BB%E5%88%97%EF%BC%89';

/**
 * @method
 * @desc 启动和接受返回结果
 */
getDataShared.startRequest(url, proving).then(data => {
    const pathData = path.join(__dirname, 'prop.json');
    fs.writeFileSync(pathData, JSON.stringify(data));
    console.log('道具爬取完成');
}).catch(error => {
    console.log('错误回调', error)
});

/**
 * @method
 * @param {function} $ html解析的返回对象
 * @returns {object} 返回爬取的所有数据
 * @desc 循环遍历结构中的数据，查询数据起点
 */
async function proving($) {
    const title = $('.mw-parser-output').find('h3,h2');
    const list = [];
    for (let a = 0; a < title.length; a++) {
        const text = $(title[a]).text().toString();
        const data = await appoint($, title[a], text);
        if (data) {
            list.push(data);
        }
    }
    return list;
}

/**
 * @method
 * @param {function} $ html解析的返回对象
 * @param {jQuery} brother 上一个兄弟元素，列表的标题元素
 * @param {string} text table的名字
 * @returns {boolean || object} 没有数据可以爬取 || 返回爬取的所有数据
 * @desc 区分出数据起点的列表
 */
function appoint($, brother, text) {
    const child = $(brother).next();
    if (child.length) {
        if ($(child).prop("tagName") === 'TABLE') {
            return getData($, child, text);
        } else if($(child).prop("tagName") === 'H3') {
            return false;
        } else {
            return appoint($, child, text);
        }
    } else {
        return false;
    }
}

/**
 * @method
 * @param {function} $ html解析的返回对象
 * @param {jQuery} table 上一个兄弟元素，列表的标题元素
 * @param {string} text 上一个兄弟元素，列表的标题元素
 * @returns {object} 返回爬取的所有数据
 * @desc 爬取每个列表的每条数据
 */
async function getData($, table, text) {
    const TR = $(table).find('tr');
    const data = {
        name: text,
        info: [],
    };
    for (let i = 0; i < TR.length; i++) {
        const TD = $(TR[i]).find('td');
        const abilityList = {};
        if (TD.length >= 5) {
            for (let a = 0; a < TD.length; a++) {
                if (!!getName(a)) {
                    if (a === 0) {
                        const src = $(TD[a]).find('img').attr('data-url');
                        const alt = $(TD[a]).find('img').attr('alt');
                        if (alt !== '未知' && src) {
                            // abilityList[getName(a)] = await getDataShared.savedImg(src);
                        }
                    } else {
                        if (a === 1) {
                            abilityList['href'] = $(TD[a]).find('a').attr('href');
                        }
                        abilityList[getName(a)] = $(TD[a]).text().replace(/[\r\n]/g, '');
                    }
                }
            }
            data['info'].push(abilityList);
        }
    }
    return data;
}

/**
 * @method
 * @param {number} index 下标
 * @returns {string} 下标对应的键
 * @desc 根据下标取的该下标的键
 */
function getName(index) {
    switch (index) {
        case 0:
            return 'src';
        case 1:
            return 'chinaName';
        case 2:
            return 'japanName';
        case 3:
            return 'englishName';
        case 4:
            return 'explain';
        default:
            return '';
    }
}