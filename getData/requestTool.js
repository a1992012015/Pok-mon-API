import request from 'request';
import cheerio from 'cheerio';
import iconv from 'iconv-lite';
import fs from 'fs';

const url = 'https://wiki.52poke.com/wiki/%E7%89%B9%E6%80%A7%E5%88%97%E8%A1%A8';

startRequest(url);

// 开始爬取页面
function startRequest(x) {

    const options = {
        method: 'get',
        url: x,
        encoding: null,
        gzip: true,
    };

    // 采用http模块向服务器发起一次get请求
    request(options, function(err, response, body) {
        if (!err && response.statusCode === 200) {

            // 转换编码格式
            const html = iconv.decode(body, 'UTF-8');

            // 解析页面
            let $ = cheerio.load(html);

            const title = $('span.mw-headline');

            title.map(function(i, el) {
                const text = $(el).text();
                console.log(`第${i + 1}个=>`, text);
            })
        } else {
            console.log('get page error url => ' + href);
        }
    }).on('error', function (err) {

        // 错误回调
        console.log(err);
    });
}

export default startRequest;