/**
 * Created by 圆环之理 on 2018/8/25.
 *
 * 功能：爬取PM详细信息
 *
 */
'use strict';

import GetDataShared from './getDataShared';
import config from 'config-lite';

export default class RequestIllustrations extends GetDataShared {

    constructor() {
        super();
        const {urlIllustrations} = config(__dirname);
        this.urlIllustrations = urlIllustrations;
    }

    /**
     * @method
     * @desc 启动和接受返回结果
     */
    async start() {
        const $ = await this.startRequest(this.urlIllustrations);
        this.proving($);
    }

    /**
     * @method
     * @param {jQuery | HTMLElement | function} $ html解析的返回对象
     * @returns {object} 返回爬取的所有数据
     * @desc 循环遍历结构中的数据，查询数据起点
     */
    async proving($) {
        const table = $('table.a-c.roundy.eplist');
        this.requestDate($, table);
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table 查询到数据的列表块
     * @returns {object} 返回爬取的每一个世代的数据
     * @desc 整合获取到的所有数据并且插入到数据库
     */
    async requestDate($, table) {
        const tr = $(table).find('tr');
        for (let i = 0; i < tr.length; i++) {
            const td = $(tr[i]).find('td');
            if (td.length >= 4) {
                const data = {};
                for (let a = 0; a < td.length; a++) {
                    if (a === 1) {
                        const childUrl = $(td[a]).find('a').attr('href').toString();
                        const child$ = await this.startRequest(childUrl);
                        const info = this.provingChild(child$, data);
                        console.log($(td[a]).text().trim());
                    }
                    data[this.getName(a)] = $(td[a]).text().trim();
                }
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
                return 'info';
            default:
                return '';
        }
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {object} data 储存查找到的属性值
     * @returns {string} 子级页面返回的信息
     * @desc 查找子级页面，根据需要查询的标签和文字，确定坐标，返回一段html
     */
    provingChild($, data) {
        const type = $('table.roundy.a-r.at-c')[0];
        const tr = $(type).children().children();
        console.log('========================================');
        for (let i = 0; i < tr.length; i++) {
            this.provingTagNameB($, tr[i], data);
        }
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} tr 查询到数据的列表块
     * @param {object} data 储存查找到的属性值
     * @returns {string} 子级页面返回的信息
     * @desc 查找子级页面，根据需要查询的标签和文字，确定坐标，返回一段html
     */
    provingTagNameB($, tr, data) {
        const table = $(tr).find('table');
        for (let a = 0; a < table.length; a++) {
            const b = $(table[a]).find('b');
            for (let i = 0; i < b.length; i++) {
                const tagNameA = $(b[i]).find('a');
                if (tagNameA.length) {
                    const text = $(tagNameA).text().trim();
                    if (text === '属性') {
                        console.log(text);
                        this.getType($, table[a], data);
                    } else if (text === '特性') {
                        console.log(text);
                        this.getAbility($, table[a], data);
                    } else if (text === '捕获率') {
                        console.log(text);
                    } else if (text === '性别比例') {
                        console.log(text);
                    } else if (text === '培育') {
                        console.log(text);
                    } else if (text === '取得基础点数') {
                        console.log(text);
                    }
                }
            }
        }
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table 查询到数据的列表块
     * @param {object} data 储存查找到的属性值
     * @returns {string} 子级页面返回的信息
     * @desc 查找子级页面，根据需要查询的标签和文字，确定坐标，返回一段html
     */
    getType($, table, data) {
        const span = $(table).find('table').find('span');
        data['type'] = [];
        for (let i = 0; i < span.length; i++) {
            data['type'].push(this.type($(span[i]).text().trim().toString()));
        }
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table 查询到数据的列表块
     * @param {object} data 储存查找到的属性值
     * @returns {string} 子级页面返回的信息
     * @desc 查找子级页面，根据需要查询的标签和文字，确定坐标，返回一段html
     */
    getAbility($, table, data) {
        const childTable = $(table).find('table').find('td');
        for (let i = 0; i < childTable.length; i++) {
            const childA = $(childTable[i]).find('a');
            for (let i = 0; i < childTable.length; i++) {

            }
        }
    }
}