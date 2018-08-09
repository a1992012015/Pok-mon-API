/**
 * Created by 圆环之理 on 2018/8/4.
 *
 * 功能：爬取道具列表
 *
 */
'use strict';

const GetDataShared = require('./getDataShared');
const Mysql = require('../shared/mysql');

const linkSql = new Mysql();
const getDataShared = new GetDataShared();
const url = '/wiki/%E9%81%93%E5%85%B7%E5%88%97%E8%A1%A8%EF%BC%88%E4%B8%BB%E7%B3%BB%E5%88%97%EF%BC%89';
let propIndex = 1;

/**
 * @method
 * @param {number} time 爬取页面的周期
 * @desc 启动和接受返回结果
 */
module.exports = function (time = 604800) {
    getDataShared.startRequest(url, proving);
    setTimeout(() => {
        getDataShared.startRequest(url, proving);
    }, time);
};


/**
 * @method
 * @param {function} $ html解析的返回对象
 * @returns {object} 返回爬取的所有数据
 * @desc 分析父级页面，循环遍历结构中的数据，查询数据起点
 */
async function proving($) {
    const title = $('.mw-parser-output').find('h4,h3,h2');
    const list = [];
    for (let a = 0; a < title.length; a++) {
        const text = $(title[a]).text().replace(/[\r\n]/g, '').toString();
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
 * @desc 查找table列表是否存在，存在则作为新的数据起点
 */
function appoint($, brother, text) {
    const child = $(brother).next();
    // 判断是否查找到了子级目标
    if (child.length) {
        if ($(child).prop("tagName") === 'TABLE') {
            console.log(`=================================${propIndex}---${text}=================================`);
            return getData($, child, text);
        } else if($(child).prop("tagName") === 'H4' || $(child).prop("tagName") === 'H3') {
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
                        const src = $(TD[a]).find('img').attr('data-url').toString();
                        const alt = $(TD[a]).find('img').attr('alt');
                        if (alt !== '未知' && src) {
                            // abilityList[getName(a)] = await getDataShared.savedImg(src);
                        }
                        abilityList[getName(a)] = src;
                    } else {
                        if (a === 1) {
                            const href = $(TD[a]).find('a').attr('href').toString();
                            abilityList['detailInfo'] = await getDataShared.startRequest(href, provingChild);
                        }
                        abilityList[getName(a)] = $(TD[a]).text().replace(/[\r\n]/g, '');
                    }
                }
            }
            abilityList['id'] = propIndex;
            const  addSql = 'INSERT INTO prop_list(prop_id, china_name, japan_name, english_name, info, detail_info, src) VALUES(?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE china_name = VALUES(china_name), japan_name = VALUES(japan_name), english_name = VALUES(english_name), info = VALUES(info), detail_info = VALUES(detail_info), src = VALUES(src)';
            let param = ['id', 'chinaName', 'japanName', 'englishName', 'info', 'detailInfo', 'src'];
            param = getDataShared.setParam(abilityList, param);
            // 插入数据库
            linkSql.append_data(addSql, param);
            propIndex++;
            data['info'].push(abilityList);
        }
    }
    return data.info.length > 0 ? data : false;
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
            return 'info';
        default:
            return '';
    }
}

/**
 * @method
 * @param {function} $ html解析的返回对象
 * @returns {string} 子级页面返回的信息
 * @desc 查找子级页面，根据需要查询的标签和文字，确定坐标，返回一段html
 */
function provingChild($) {
    return getDataShared.defineAddress($, 'h2', '效果');
}