/**
 * Created by 圆环之理 on 2018/8/4.
 *
 * 功能：爬取特性列表
 *
 */
'use strict';

const GetDataShared = require('./getDataShared');
const mysql = require('../shared/mysql');

const linkSql = new mysql();
const getDataShared = new GetDataShared();
const url = '/wiki/%E7%89%B9%E6%80%A7%E5%88%97%E8%A1%A8';

/**
 * @method
 * @param {number} time 爬取页面的周期
 * @desc 启动和接受返回结果
 */
module.exports = function (time = 604800) {
    setTimeout(() => {
        getDataShared.startRequest(url, proving);
    }, time)
};


/**
 * @method
 * @param {function} $ html解析的返回对象
 * @returns {object} 返回爬取的所有数据
 * @desc 循环遍历结构中的数据，查询数据起点
 */
async function proving($) {
    const title = $('h2');
    const list = {};
    for (let a = 0; a < title.length; a++) {
        const text = $(title[a]).text();
        if (text.indexOf('特性') !== -1) {
            list[`ability-${a}`] = await requestDate($, title[a], a + 3);
        }
    }
    return list;
}

/**
 * @method
 * @param {function} $ html解析的返回对象
 * @param {jQuery} table 查询到数据的列表块
 * @param {number} generation 数据所属的世代
 * @returns {object} 返回爬取的每一个世代的数据
 * @desc 整合获取到的所有数据并且插入到数据库
 */
async function requestDate($, table, generation) {
    const tableList = $(table).next();
    const data = [];
    const tr = $(tableList).find('tr');
    for (let a = 0; a < tr.length; a++) {
        const td = $(tr[a]).find('td');
        const abilityList = {};
        if (td.length) {
            for (let i = 0; i < td.length; i++) {
                if (!!getName(i)) {
                    if (i === 1) {
                        const href = $(td[i]).find('a').attr('href').toString();
                        abilityList['detailInfo'] = await getDataShared.startRequest(href, provingChild);
                    }
                    abilityList[getName(i)] = $(td[i]).text().trim();
                }
            }
            abilityList['generation'] = generation;
            const  addSql = 'INSERT INTO ability_list(ability_id, china_name, japan_name, english_name, generation, info, detail_info) VALUES(?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE china_name = VALUES(china_name), japan_name = VALUES(japan_name), english_name = VALUES(english_name), generation = VALUES(generation), info = VALUES(info), detail_info = VALUES(detail_info)';
            let param = ['id', 'chinaName', 'japanName', 'englishName', 'generation', 'info', 'detailInfo'];
            param = getDataShared.setParam(abilityList, param);
            // 插入数据库
            linkSql.append_data(addSql, param);
            console.log(`========================================${abilityList[getName(0)]}--${abilityList[getName(1)]}========================================`);
            data.push(abilityList);
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
            return 'id';
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
    return getDataShared.defineAddress($, 'h2', '特性效果');
}