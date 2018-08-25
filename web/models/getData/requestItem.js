/**
 * Created by 圆环之理 on 2018/8/10.
 *
 * 功能：爬取招式列表
 *
 */
'use strict';

import GetDataShared from './getDataShared';
import config from 'config-lite';

export default class RequestItem extends GetDataShared {

    constructor() {
        super();
        const {urlAbility} = config(__dirname);
        this.urlItem = urlAbility;
    }

    /**
     * @method
     * @desc 启动
     */
    async start() {
        const $ = await this.startRequest(this.urlItem);
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
        for (let i = 0; i < title.length; i++) {
            const text = $(title[i]).text().toString();
            if (text.indexOf('世代') !== -1) {
                await this.appoint($, title[i]);
            }
        }
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} brother 上一个兄弟元素，列表的标题元素
     * @returns {boolean || object} 没有数据可以爬取 || 返回爬取的所有数据
     * @desc 查找table列表是否存在，存在则作为新的数据起点
     */
    appoint($, brother) {
        const child = $(brother).next();
        // 判断是否查找到了子级目标
        if ($(child).prop("tagName") === 'TABLE') {
            this.getData($, child);
        }
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table 上一个兄弟元素，列表的标题元素
     * @returns {object} 返回爬取的所有数据
     * @desc 爬取每个列表的每条数据
     */
    async getData($, table) {
        const TR = $(table).find('tr');
        for (let i = 0; i < TR.length; i++) {
            const TD = $(TR[i]).find('td');
            const childList = {};
            if (TD.length >= 9) {
                for (let a = 0; a < TD.length; a++) {
                    const childText = $(TD[a]).text().trim().toString();
                    if (a === 1) {
                        let href;
                        const tagA = $(TD[a]).find('a');
                        if (tagA.length > 1) {
                            href = $(tagA).eq(1).attr('href').toString();
                        } else {
                            href = $(tagA).attr('href').toString();
                        }
                        const chile$ = await this.startRequest(href);
                        const {info, detail, detail_info} = this.moveDetail(chile$);
                        childList['info'] = info;
                        childList['detail'] = detail;
                        childList['detail_info'] = detail_info;
                        childList[this.getName(a)] = childText;
                    } else if (a === 4) {
                        childList[this.getName(a)] = this.type(childText);
                    } else if (a === 5) {
                        childList[this.getName(a)] = this.damage(childText);
                    } else {
                        childList[this.getName(a)] = childText;
                    }
                }
                const addSql = 'INSERT INTO item_list(item_id, china_name, japan_name, english_name, type, damage, power, accuracy, power_point, info, detail, detail_info) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?) ON DUPLICATE KEY UPDATE china_name = VALUES(china_name), japan_name = VALUES(japan_name), english_name = VALUES(english_name), type = VALUES(type), damage = VALUES(damage), power = VALUES(power), accuracy = VALUES(accuracy), power_point = VALUES(power_point), info = VALUES(info), detail = VALUES(detail), detail_info = VALUES(detail_info)';
                let param = ['id', 'chinaName', 'japanName', 'englishName', 'type', 'damage', 'power', 'accuracy', 'powerPoint', 'info', 'detail', 'detail_info'];
                param = this.setParam(childList, param);
                // 插入数据库
                this.append_data(addSql, param);
                console.log(`=======================================${childList[this.getName(1)]}=======================================`)
            }
        }
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
        info['detail_info'] = this.provingChild($);
        return info;
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @returns {string} 子级页面返回的信息
     * @desc 查找子级页面，根据需要查询的标签和文字，确定坐标，返回一段html
     */
    provingChild($) {
        return this.defineAddress($, 'h2,h3', '招式附加效果');
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table html解析的返回对象
     * @desc 删除节点上无用的类名和属性
     */
    removeAttrName($, table) {
        const tableTr = $(table).find('tr');
        for (let a = 0; a < tableTr.length; a++) {
            $(tableTr[a]).removeAttr('class');
            $(tableTr[a]).removeAttr('style');
            if ($(tableTr[a]).find('ul').length > 0) {
                const tableTrUl = $(tableTr[a]).find('ul');
                $(tableTr[a]).find('td').removeAttr('class');
                $(tableTr[a]).find('td').removeAttr('style');
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