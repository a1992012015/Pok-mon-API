const request = require("request");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const fs = require("fs");

const url = 'https://wiki.52poke.com/wiki/%E7%89%B9%E6%80%A7%E5%88%97%E8%A1%A8';

startRequest(url);

// 开始爬取页面
function startRequest(x) {
    console.log('开始');

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

            // let setHomepage = setJson($, title);
            proving(setJson($));

        } else {
            console.log('get page error url => ' + err);
        }
    });
}

function proving(setHomepage) {

    const a = setHomepage.next();

    if (a.done) {
        return;
    }

    a.value.then(function() {
        proving(setHomepage);
    }, function() {
        proving(setHomepage);
    })
}

function *setJson($) {

    const title = $('span.mw-headline');

    for (let a = 0; a < title.length; a++) {
        const text = $(title[a]).text();
        console.log(`第${a + 1}个=>`, text);
        yield setText(a, text);
    }
}

function setText(index, text) {
    return new Promise((resolve, reject) => {

        const buf = new Buffer.alloc(1024);

        fs.open('./features.json', 'a+', function(err, fd) {
            if (err) {
                reject();
                return console.error(err);
            }
            console.log("文件打开成功！");
            fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
                if (err){
                    console.log(err);
                }
                console.log(bytes + "  字节被读取");
                let data;
                if (!bytes) {
                    data = {};
                } else {
                    data = JSON.parse(buf.slice(0, bytes).toString());
                    console.log(data);
                }

                data[`features${index}`] = text;

                fs.writeFile('./features.json', JSON.stringify(data),  function(err2) {
                    if (err2) {
                        return console.error(err2);
                    }
                    console.log("数据写入成功！");
                    fs.readFile('./features.json', function (err3, data3) {
                        if (err3) {
                            return console.error(err3);
                        }
                        console.log("异步读取文件数据: " + data3.toString());
                        resolve();
                    });
                });
            });
        });
    });
}