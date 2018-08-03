const request = require("request");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const fs = require("fs");

const action = 'https://wiki.52poke.com';

const url = '/wiki/%E7%89%B9%E6%80%A7%E5%88%97%E8%A1%A8';

requestDateList(url).then(data => {
    console.log(data);
    console.log('结束');
}).catch(error => {
    console.log(error)
});


async function requestDateList(url) {

    return await startRequest(url, proving);
}

// 开始爬取页面
function startRequest(x, cb) {
    console.log('开始');
    const src = `${action}${x}`;

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

// 解析父级
async function proving($) {
    const title = $('h2');
    const list = {};

    for (let a = 0; a < title.length; a++) {
        const text = $(title[a]).text();
        if (text.indexOf('特性') !== -1) {
            list[`ability-${a}`] = await requestDate($, title[a]);
        }
    }

    return list;
}

// 数据整合
async function requestDate($, table) {
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
                        abilityList['href'] = $(td[i]).find('a').attr('href');
                        const childData = await startRequest($(td[i]).find('a').attr('href'), provingChild);
                        console.log(childData);
                    }

                    abilityList[getName(i)] = $(td[i]).text().replace(/[\r\n]/g, '');
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

    console.log('开始子级');

    for (let i = 0; i < title.length; i++) {
        const battle = $(title[i]).text().replace(/[\r\n]/g, '');

        if (battle === '对战中') {
            console.log(battle);
            const child = $(title[i]).next('p');
            console.log($(child).text());
        } else if (battle === '对战外') {
            console.log(battle);
            const child = $(title[i]).next('p');
            console.log($(child).text());
        }
    }

    return '098';
}