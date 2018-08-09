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
module.exports = function requestAbility(time = 604800) {
    getDataShared.startRequest(url, proving);
    setTimeout(() => {
        getDataShared.startRequest(url, proving).then(data => {
            console.log('特性爬取结束');
        }).catch(error => {
            console.log(error)
        });
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
                    abilityList[getName(i)] = $(td[i]).text().replace(/[\r\n]/g, '');
                }
            }
            abilityList['generation'] = generation;
            const  addSql = 'INSERT INTO ability_list(ability_id, china_name, japan_name, english_name, generation, info, detail_info) VALUES(?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE china_name = VALUES(china_name), japan_name = VALUES(japan_name), english_name = VALUES(english_name), generation = VALUES(generation), info = VALUES(info), detail_info = VALUES(detail_info)';
            let param = ['id', 'chinaName', 'japanName', 'englishName', 'generation', 'info', 'detailInfo'];
            param = setParam(abilityList, param);
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
 * @param {Object} abilityList 每一条数据
 * @param {Array} param 需要排序成的数组
 * @returns {Array} 可以插入数据的结构顺序
 * @desc 将获取到的对象数据转换成可插入数据库的数组
 */
function setParam(abilityList, param) {
    param = param.map((item) => {
        return abilityList[item];
    });
    return param;
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
 * @returns {string} 子级页面选取的数据
 * @desc 遍历子级页面寻找数据起点
 */
function provingChild($) {
    const title = $('h2');
    let startIndex;
    let endIndex;
    for (let i = 0; i < title.length; i++) {
        const battle = title.eq(i).text().replace(/[\r\n]/g, '').toString();
        if (battle === '特性效果') {
            startIndex = i;
            endIndex = i + 1;
        }
    }
    const html = title.eq(startIndex).nextUntil(title.eq(endIndex));
    let outerHTML = '';
    for (let i = 0; i < html.length; i++) {
        outerHTML += analysisHtml($, html.eq(i));
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
function analysisHtml($, html) {
    if ($(html).prop('tagName') === 'UL') {
        const htmlUl = $(html).find('li');
        for (let i = 0; i < htmlUl.length; i++) {
            const content = $(htmlUl[i]).text().replace(/[\r\n]/g, '');
            $(htmlUl[i]).html(content);
        }
    } else {
        const content = $(html).text().replace(/[\r\n]/g, '');
        $(html).html(content);
    }
    return $(html).html($(html)).html();
}