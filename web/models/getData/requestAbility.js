/**
 * Created by 圆环之理 on 2018/8/4.
 *
 * 功能：爬取特性列表
 *
 */
'use strict';

import GetDataShared from './getDataShared';

const url = '/wiki/%E7%89%B9%E6%80%A7%E5%88%97%E8%A1%A8';

export default class RequestAbility extends GetDataShared {

    constructor() {
        super();
    }

    /**
     * @method
     * @desc 启动和接受返回结果
     */
    async start() {
        const $ = await this.startRequest(url);
        this.proving($);
    }

    /**
     * @method
     * @param {jQuery | HTMLElement | function} $ html解析的返回对象
     * @returns {object} 返回爬取的所有数据
     * @desc 循环遍历结构中的数据，查询数据起点
     */
    async proving($) {
        const title = $('h2');
        for (let a = 0; a < title.length; a++) {
            const text = $(title[a]).text();
            if (text.indexOf('特性') !== -1) {
                await this.requestDate($, title[a], a + 3);
            }
        }
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table 查询到数据的列表块
     * @param {number} generation 数据所属的世代
     * @returns {object} 返回爬取的每一个世代的数据
     * @desc 整合获取到的所有数据并且插入到数据库
     */
    async requestDate($, table, generation) {
        const tableList = $(table).next();
        const tr = $(tableList).find('tr');
        for (let a = 0; a < tr.length; a++) {
            const td = $(tr[a]).find('td');
            const abilityList = {};
            if (td.length) {
                for (let i = 0; i < td.length; i++) {
                    if (!!this.getName(i)) {
                        if (i === 1) {
                            const href = $(td[i]).find('a').attr('href').toString();
                            const child$ = await this.startRequest(href);
                            abilityList['detailInfo'] = this.provingChild(child$);
                        }
                        abilityList[this.getName(i)] = $(td[i]).text().trim();
                    }
                }
                abilityList['generation'] = generation;
                const  addSql = 'INSERT INTO ability_list(ability_id, china_name, japan_name, english_name, generation, info, detail_info) VALUES(?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE china_name = VALUES(china_name), japan_name = VALUES(japan_name), english_name = VALUES(english_name), generation = VALUES(generation), info = VALUES(info), detail_info = VALUES(detail_info)';
                let param = ['id', 'chinaName', 'japanName', 'englishName', 'generation', 'info', 'detailInfo'];
                param = this.setParam(abilityList, param);
                // 插入数据库
                this.append_data(addSql, param);
                console.log(`========================================${abilityList[this.getName(0)]}--${abilityList[this.getName(1)]}========================================`);
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
     * @returns {string} 子级页面返回的信息
     * @desc 查找子级页面，根据需要查询的标签和文字，确定坐标，返回一段html
     */
    provingChild($) {
        return this.defineAddress($, 'h2', '特性效果');
    }
};