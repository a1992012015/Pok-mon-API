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

getDataShared.startRequest(url, proving).then(data => {
    console.log(data);
    console.log('道具爬取完成');
}).catch(error => {
    console.log('错误回调', error)
});

async function proving($) {
    const title = $('.mw-parser-output').find('h3,h2');
    const list = [];

    for (let a = 0; a < title.length; a++) {
        const data = await appoint($, title[a]);
        if (data) {
            list.push(data);
        }
    }

    return list;
}

function appoint($, brother) {
    const child = $(brother).next();
    const text = $(brother).text();

    if (child.length) {
        if ($(child).prop("tagName") === 'TABLE') {
            return getData($, child, text);
        } else if($(child).prop("tagName") === 'H3') {
            return false;
        } else {
            appoint($, child);
        }
    } else {
        return false;
    }
}

async function getData($, table, text) {
    const TR = $(table).find('tr');
    const data = [];

    for (let i = 0; i < TR.length; i++) {
        const TD = $(TR[i]).find('td');
        const abilityList = {
            name: text,
        };

        if (TD.length) {
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
            data.push(abilityList);
        }
    }

    return data;
}

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
        default:
            return '';
    }
}