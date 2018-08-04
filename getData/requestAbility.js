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

requestDateList(url).then(data => {
    console.log(data);
    console.log('结束');
}).catch(error => {
    console.log(error)
});

function requestDateList(url) {

    return getDataShared.startRequest(url, proving);

}

// 解析父级
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

// 数据整合
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

                        const info = await getDataShared.startRequest($(td[i]).find('a').attr('href'), provingChild);

                        Object.assign(abilityList, info);
                    }
                    abilityList[getName(i)] = $(td[i]).text().replace(/[\r\n]/g, '');
                }
            }

            abilityList['generation'] = generation;

            const  addSql = 'INSERT INTO ability_list(ability_id, china_name, japan_name, english_name, generation, in_war, out_war, in_tips, out_tips, warn_info) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE china_name = VALUES(china_name), japan_name = VALUES(japan_name), english_name = VALUES(english_name), generation = VALUES(generation), in_war = VALUES(in_war), out_war = VALUES(out_war), in_tips = VALUES(in_tips), out_tips = VALUES(out_tips), warn_info = VALUES(warn_info)';

            const param = setParam(abilityList);

            // 插入数据库
            // linkSql.append_data(addSql, param);

            console.log(abilityList);

            data.push(abilityList);
        }
    }

    return data;
}

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

function provingChild($) {
    const title = $('h3');

    const info = {};

    for (let i = 0; i < title.length; i++) {
        const battle = $(title[i]).text().replace(/[\r\n]/g, '');

        if (battle === '对战中' || battle === '对战外') {

            Object.assign(info, findChild($, $(title[i]), battle, info));

        }
    }

    return info;
}

function findChild($, father, battle, info) {

    const child = $(father).next();

    if ($(child).prop("tagName") === 'P') {

        const flag = battle === '对战中' ? 'inWar' : 'outWar';

        if (info.hasOwnProperty(flag)) {
            info['warn'] = $(child).text().replace(/[\r\n]/g, '');
        } else {
            info[flag] = $(child).text().replace(/[\r\n]/g, '');
        }

        findChild($, child, battle, info);

    } else if($(child).prop("tagName") === 'UL') {

        const childLi = $(child).find('li');

        for (let i = 0; i < childLi.length; i++) {

            const flag = battle === '对战中' ? 'inTips' : 'outTips';

            info[flag] = [];

            info[flag].push($(childLi).text().replace(/[\r\n]/g, ''));
        }

        findChild($, child, battle, info);
    } else if($(child).prop("tagName") === 'DL') {

        findChild($, child, battle, info);
    } else {

        return info;

    }
}