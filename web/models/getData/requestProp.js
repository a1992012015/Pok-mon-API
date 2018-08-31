/**
 * Created by 圆环之理 on 2018/8/4.
 *
 * 功能：爬取道具列表
 *
 */
'use strict';

import GetDataShared from './getDataShared';
import config from 'config-lite';
const opencc = require('node-opencc');

let propIndex = 1;

export default class RequestProp extends GetDataShared {

    constructor() {
        super();
        const {urlProp} = config(__dirname);
        this.urlProp = urlProp;
    }

    /**
     * @method
     * @desc 启动和接受返回结果
     */
    async start() {
        console.log('开始查找道具');
        const $ = await this.startRequest(this.urlProp);
        this.proving($);
    }

    /**
     * @method
     * @param {jQuery | HTMLElement | function} $ html解析的返回对象
     * @returns {object} 返回爬取的所有数据
     * @desc 分析父级页面，循环遍历结构中的数据，查询数据起点
     */
    async proving($) {
        const title = $('.mw-parser-output').find('h4,h3,h2');
        for (let a = 0; a < title.length; a++) {
            const text = $(title[a]).text().trim().toString();
            await this.appoint($, title[a], text);
        }
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
        if (child.length) {
            if ($(child).prop("tagName") === 'TABLE') {
                this.getData($, child);
            } else if ($(child).prop("tagName") === 'H4' || $(child).prop("tagName") === 'H3') {

            } else {
                this.appoint($, child, text);
            }
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
            const abilityList = {};
            if (TD.length >= 5) {
                let alt;
                for (let a = 0; a < TD.length; a++) {
                    if (!!this.getName(a)) {
                        if (a === 0) {
                            const src = $(TD[a]).find('img').attr('data-url').toString();
                            alt = $(TD[a]).find('img').attr('alt');
                            abilityList[this.getName(a)] = `https:${src}`;
                        } else {
                            if (a === 1) {
                                const href = $(TD[a]).find('a').attr('href').toString();
                                const chile$ = await this.startRequest(href);
                                abilityList['detailInfo'] = this.provingChild(chile$);
                                abilityList[this.getName(a)] = opencc.hongKongToSimplified($(TD[a]).text().trim());
                            } else {
                                abilityList[this.getName(a)] = $(TD[a]).text().trim();
                            }
                        }
                    }
                }
                if (alt === '未知') {
                    abilityList['src'] = '/pokemon/prop/default.png'
                } else {
                    abilityList['src'] = await this.savedImg(abilityList['src'], abilityList['englishName']);
                }
                abilityList['id'] = propIndex;
                const addSql = 'INSERT INTO prop_list(prop_id, china_name, japan_name, english_name, info, detail_info, src) VALUES(?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE china_name = VALUES(china_name), japan_name = VALUES(japan_name), english_name = VALUES(english_name), info = VALUES(info), detail_info = VALUES(detail_info), src = VALUES(src)';
                let param = ['id', 'chinaName', 'japanName', 'englishName', 'info', 'detailInfo', 'src'];
                param = this.setParam(abilityList, param);
                // 插入数据库
                this.append_data(addSql, param);
                console.log(`=================================${propIndex}---${abilityList[this.getName(1)]}=================================`);
                propIndex++;
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
                return 'src';
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
    provingChild($) {
        return this.defineAddress($, 'h2', '效果');
    }
};