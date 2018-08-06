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
 * @desc 启动和接受返回结果
 */
getDataShared.startRequest(url, proving).then(data => {
    console.log(data);
    console.log('特性爬取结束');
}).catch(error => {
    console.log(error)
});

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
                        const info = await getDataShared.startRequest(href, provingChild);
                        Object.assign(abilityList, info);
                    }
                    abilityList[getName(i)] = $(td[i]).text().replace(/[\r\n]/g, '');
                }
            }
            abilityList['generation'] = generation;
            // const  addSql = 'INSERT INTO ability_list(ability_id, china_name, japan_name, english_name, generation, in_war, out_war, in_tips, out_tips, warn_info) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE china_name = VALUES(china_name), japan_name = VALUES(japan_name), english_name = VALUES(english_name), generation = VALUES(generation), in_war = VALUES(in_war), out_war = VALUES(out_war), in_tips = VALUES(in_tips), out_tips = VALUES(out_tips), warn_info = VALUES(warn_info)';
            const param = setParam(abilityList);
            // 插入数据库
            // linkSql.append_data(addSql, param);
            console.log(`====================${abilityList[getName(0)]}--${abilityList[getName(1)]}====================`);
            data.push(abilityList);
        }
    }
    return data;
}

/**
 * @method
 * @param {object} param 每一条数据
 * @returns {Array} 可以插入数据的结构顺序
 * @desc 将获取到的对象数据转换成可插入数据库的数组
 */
function setParam(param) {
    const arr = new Array(10);
    for (let i = 0; i < arr.length; i++) {
        if (i === 0) {
            arr[i] = parseInt(param['id']);
        } else if (i === 1) {
            arr[i] = param['chinaName'];
        } else if (i === 2) {
            arr[i] = param['japanName'];
        } else if (i === 3) {
            arr[i] = param['englishName'];
        } else if (i === 4) {
            arr[i] = param['generation'];
        } else if (i === 5) {
            arr[i] = param['inWar'];
        } else if (i === 6) {
            arr[i] = param['outWar'] ? param['outWar'] : null;
        } else if (i === 7) {
            arr[i] = param['inTips'] ? JSON.stringify(param['inTips']) : null;
        } else if (i === 8) {
            arr[i] = param['outTips'] ? JSON.stringify(param['outTips']) : null;
        } else {
            arr[i] = param['warn'] ? param['warn'] : null;
        }
    }
    return arr;
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
        default:
            return '';
    }
}

/**
 * @method
 * @param {function} $ html解析的返回对象
 * @returns {string} 子级页面选取的数据
 * @desc 遍历子级页面寻找数据起点
 */
function provingChild($) {
    const title = $('h3');
    const info = {};
    for (let i = 0; i < title.length; i++) {
        const battle = $(title[i]).text().replace(/[\r\n]/g, '').toString();
        if (battle === '对战中') {
            findChild($, title[i], battle, info);
        }
    }
    console.log(info);
    return info;
}

/**
 * @method
 * @param {function} $ html解析的返回对象
 * @param {jQuery} father 数据爬取起点
 * @param {string} battle 确认是对战中还是对战外的下标
 * @param {object} info 存储子级页面的数据
 * @desc 开始爬取子级页面的数据
 */
function findChild($, father, battle, info) {
    const child = $(father).next();
    if ($(child).prop("tagName") === 'P') {
        const flag = battle === '对战中' ? 'inWar' : 'outWar';
        info[flag] = $(child).text().replace(/[\r\n]/g, '');
        findChildren($, child, battle, info)
    } else {
        findChild($, child, battle, info)
    }
}

/**
 * @method
 * @param {function} $ html解析的返回对象
 * @param {jQuery} child 数据爬取起点
 * @param {string} battle 确认是对战中还是对战外的下标
 * @param {object} info 存储子级页面的数据
 * @desc 区分对战中和对战外的数据
 */
function findChildren($, child ,battle , info) {
    const children = $(child).next();
    const childrenBattle = $(children).text().replace(/[\r\n]/g, '').toString();
    if ($(children).prop("tagName") === 'H3' && childrenBattle === '对战外') {
        findChild($, children, childrenBattle, info);
        return;
    } else {
        if ($(children).prop("tagName") === 'P') {
            const flag = battle === '对战中' ? 'inTips' : 'outTips';
            if (info.hasOwnProperty(flag)) {
                info['warn'] = ($(children).text().replace(/[\r\n]/g, ''));
            } else {
                info[flag] = !!info[flag] ? info[flag] : {};
                info[flag]['title'] = $(children).text().replace(/[\r\n]/g, '');
            }
        } else if ($(children).prop("tagName") === 'UL') {
            const childLi = $(children).find('li');
            const flag = battle === '对战中' ? 'inTips' : 'outTips';
            info[flag] = !!info[flag] ? info[flag] : {};
            info[flag]['list'] = [];
            for (let i = 0; i < childLi.length; i++) {
                info[flag]['list'].push($(childLi[i]).text().replace(/[\r\n]/g, ''));
            }
        } else {
            return;
        }
    }
    findChildren($, children ,battle , info);
}