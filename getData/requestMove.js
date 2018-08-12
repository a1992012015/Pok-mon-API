/**
 * Created by 圆环之理 on 2018/8/10.
 *
 * 功能：爬取招式列表
 *
 */
'use strict';

const fs = require("fs");
const GetDataShared = require('./getDataShared');

const url = '/wiki/%E6%8B%9B%E5%BC%8F%E5%88%97%E8%A1%A8';

module.exports = class RequestMove extends GetDataShared {

    constructor() {
        super();
    }

    /**
     * @method
     * @desc 启动
     */
    async start() {
        const $ = await this.startRequest(url);
        this.proving($);
    }

    /**
     * @method
     * @param {jQuery | HTMLElement | function} $ html解析的返回对象
     * @returns {Array} 返回爬取的所有数据
     * @desc 循环遍历结构中的数据，查询数据起点
     */
    async proving($) {
        const title = $('h2');
        const list = [];
        for (let i = 0; i < title.length; i++) {
            const text = $(title[i]).text().toString();
            if (text.indexOf('世代') !== -1) {
                const data = await this.appoint($, title[i], text);
                list.push(data);
            }
        }
        fs.existsSync('move.json') || fs.mkdirSync('move.json');
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
    appoint($, brother, text) {
        const child = $(brother).next();
        // 判断是否查找到了子级目标
        if ($(child).prop("tagName") === 'TABLE') {
            console.log(`=================================${text}=================================`);
            return this.getData($, child, text);
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
    async getData($, table, text) {
        const TR = $(table).find('tr');
        const data = {
            name: text,
            info: [],
        };

        for (let i = 0; i < TR.length; i++) {
            const TD = $(TR[i]).find('td');
            const childList = {};
            if (TD.length >= 9) {
                for (let a = 0; a < TD.length; a++) {
                    const childText = $(TD[a]).text().trim().toString();
                    if (a === 1) {
                        const href = $(TD[a]).find('a').attr('href').toString();
                        const chile$ = await this.startRequest(href);
                        const { info, detail } = this.moveDetail(chile$);
                        childList['info'] = info;
                        childList['detail'] = detail;
                        childList[this.getName(a)] = childText;
                    } else if (a === 4) {
                        childList[this.getName(a)] = this.type(childText);
                    } else if (a === 5) {
                        childList[this.getName(a)] = this.damage(childText);
                    } else {
                        childList[this.getName(a)] = childText;
                    }
                }
                const  addSql = 'INSERT INTO move_list(move_id, china_name, japan_name, english_name, type, damage, power, accuracy, power_point, info, detail) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?) ON DUPLICATE KEY UPDATE china_name = VALUES(china_name), japan_name = VALUES(japan_name), english_name = VALUES(english_name), type = VALUES(type), damage = VALUES(damage), power = VALUES(power), accuracy = VALUES(accuracy), power_point = VALUES(power_point), info = VALUES(info), detail = VALUES(detail)';
                let param = ['id', 'chinaName', 'japanName', 'englishName', 'type', 'damage', 'power', 'accuracy', 'powerPoint', 'info', 'detail'];
                param = this.setParam(childList, param);
                // 插入数据库
                this.append_data(addSql, param);
                data.info.push(childList);
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
    getName(index) {
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
                return 'type';
            case 5:
                return 'damage';
            case 6:
                return 'power';
            case 7:
                return 'accuracy';
            case 8:
                return 'powerPoint';
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
    moveDetail($) {
        const table = $('.roundy.a-r.at-c');
        const TR = table.find('tr');
        const info = {};
        for (let i = 0; i < TR.length; i++) {
            if (i === 1) {
                info['info'] = $(TR[i]).text().trim();
            } else if (i === 3) {
                const TABLE = $(TR[i]).find('table');
                $(TABLE).removeAttr('width');
                $(TABLE).removeAttr('style');
                this.removeAttrName($, TABLE);
                info['detail'] = TABLE.html($(TABLE)).html();
            }
        }
        return info;
    }

    removeAttrName($, table) {
        const tableTr = $(table).find('tr');
        for (let a = 0; a < tableTr.length; a++) {
            $(tableTr[a]).removeAttr('class');
            $(tableTr[a]).removeAttr('style');
            if ($(tableTr[a]).find('ul').length > 0) {
                const tableTrUl = $(tableTr[a]).find('ul');
                tableTrUl.find('td').removeAttr('width');
                tableTrUl.find('td').removeAttr('style');
                const tableTrUlLi = $(tableTrUl).find('li');
                for (let b = 0; b < tableTrUlLi.length; b++) {
                    $(tableTrUlLi[b]).html($(tableTrUlLi[b]).text().trim());
                }
            } else {
                const tableTrTd = $(tableTr[a]).find('td,th');
                for (let b = 0; b < tableTrTd.length; b++) {
                    $(tableTrTd[b]).removeAttr('width');
                    $(tableTrTd[b]).removeAttr('class');
                    $(tableTrTd[b]).removeAttr('style');
                    let text;
                    if ($(tableTrTd[b]).text().trim() === '{{{priority}}}') {
                        text = 0;
                    } else {
                        text = $(tableTrTd[b]).text().trim();
                    }
                    $(tableTrTd[b]).html(text);
                }
            }
        }
    }
};