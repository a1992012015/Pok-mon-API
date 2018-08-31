/**
 * Created by 圆环之理 on 2018/8/25.
 *
 * 功能：爬取PM详细信息
 *
 */
'use strict';

import GetDataShared from './getDataShared';
import config from 'config-lite';
import fs from 'fs';

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
        for (let i = 20; i < tr.length; i++) {
            const td = $(tr[i]).find('td');
            if (td.length >= 4) {
                const data = {};
                for (let a = 0; a < td.length; a++) {
                    data[this.getName(a)] = $(td[a]).text().trim();
                    if (a === 1) {
                        const childUrl = $(td[a]).find('a').attr('href').toString();
                        console.log(`=================${data[this.getName(0)]}========================`);
                        console.log($(td[a]).text().trim());
                        console.log(`=================${data[this.getName(0)]}========================`);
                        const child$ = await this.startRequest(childUrl);
                        await this.provingChild(child$, data);
                    }
                }
/*
                console.log("准备写入文件");
                fs.writeFile(`./web/models/getData/${data['id']}.json`, JSON.stringify(data),  function(err) {
                    if (err) {
                        return console.error(err);
                    }
                    console.log("数据写入成功！");
                });*/
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
    async provingChild($, data) {
        // 查找基本信息起点
        const type = $('table.roundy.a-r.at-c');
        const tr = $(type[0]).children().children();
        for (let i = 0; i < tr.length; i++) {
            this.provingTagNameB($, tr[i], data);
        }
        // 查找多个种族值列表的名字
        const list = [];
        if (type.length > 1) {
            const nameTr = $(type[type.length - 1]).find('tr');
            for (let i = 0; i < nameTr.length; i++) {
                if (i !== 0 && !$(nameTr[i]).hasClass('hide')) {
                    const text = $(nameTr[i]).text().trim();
                    list.push(text)
                }
            }
        }
        // 查找种族值起点,可学会招式
        const tagH4 = $('h4');
        for (let i = 0; i < tagH4.length; i++) {
            const text = $(tagH4[i]).text().trim();
            if (text === '种族值') {
                const nextTable = $(tagH4[i]).next();
                this.getRacialValue($, nextTable, data, list);
            } else if (text === '可学会的招式') {
                const nextTable = $(tagH4[i]).next();
                if ($(tagH4[i]).next().prop('tagName') === 'TABLE') {
                    await this.canLearnMoves($, nextTable, data, data[this.getName(1)]);
                } else {
                    const child = await this.getHtmlStart($, tagH4[i]);
                    for (let a = 0; a < child.length; a++) {
                        await this.canLearnMoves($, child[a], data, list[a]);
                    }
                }
            } else if (text === '能使用的招式学习器') {
                const nextTable = $(tagH4[i]).next();
                if ($(tagH4[i]).next().prop('tagName') === 'TABLE') {
                    await this.skillMachine($, nextTable, data, data[this.getName(1)]);
                } else {
                    const child = await this.getHtmlStart($, tagH4[i]);
                    for (let a = 0; a < child.length; a++) {
                        await this.skillMachine($, child[a], data, list[a]);
                    }
                }
            } else if (text === '蛋招式') {
                const nextTable = $(tagH4[i]).next();
                if ($(tagH4[i]).next().prop('tagName') === 'TABLE') {
                    await this.eggSkills($, nextTable, data, data[this.getName(1)]);
                } else {
                    const child = await this.getHtmlStart($, tagH4[i]);
                    for (let a = 0; a < child.length; a++) {
                        await this.eggSkills($, child[a], data, list[a]);
                    }
                }
            } else if (text === '教授招式') {
                const nextTable = $(tagH4[i]).next();
                if ($(tagH4[i]).next().prop('tagName') === 'TABLE') {
                    await this.fixedPointTeaching($, nextTable, data, data[this.getName(1)]);
                } else {
                    const child = await this.getHtmlStart($, tagH4[i]);
                    for (let a = 0; a < child.length; a++) {
                        await this.fixedPointTeaching($, child[a], data, list[a]);
                    }
                }
            }
        }
        // 查找进化的html起点
        const tagH3 = $('h3');
        for (let i = 0; i < tagH3.length; i++) {
            const text = $(tagH3[i]).text().trim();
            if (text === '进化') {
                const childTable = await this.getEvolution($, tagH3[i]);
                for (let a = 0; a < childTable.length; a++) {

                }
            }
        }
    }

    /**
     * @method
     * @param {Function} $ html解析的返回对象
     * @param {jQuery} html 查询到数据的列表块
     * @param {Array} list 储存查找到的元素
     * @returns {Array} 查找到的元素
     * @desc 查找进化路线图
     */
    getEvolution($, html, list = []) {
        const nextTable = $(html).next();
        if ($(nextTable).prop('tagName') === 'TABLE') {
            list.push(nextTable);
            return this.getEvolution($, nextTable, list);
        } else if($(nextTable).prop('tagName') === 'H3') {
            return list;
        } else {
            return this.getEvolution($, nextTable, list);
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
                        this.getType($, table[a], data);
                    } else if (text === '特性') {
                        this.getAbility($, table[a], data);
                    } else if (text === '捕获率') {
                        this.getCapture($, table[a], data);
                    } else if (text === '性别比例') {
                        this.getSex($, table[a], data);
                    } else if (text === '培育') {
                        this.getFoster($, table[a], data);
                    } else if (text === '取得基础点数') {
                        this.getBasicPoint($, table[a], data);
                    }
                }
            }
        }
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} html H4标签需要开始查询起点的位置
     * @param {Array} child 查找到的子级结点
     * @returns {Array} 查询到的子级节点数组
     * @desc 查询招式列表的起点位置
     */
    async getHtmlStart($, html, child = []) {
        const nextTable = $(html).next();
        if ($(nextTable).prop('tagName') === 'HR') {
            return await this.getHtmlStart($, nextTable, child);
        } else if ($(nextTable).prop('tagName') === 'CENTER') {
            return await this.getHtmlStart($, nextTable, child);
        } else {
            const table = $(nextTable).children();
            if (table.length > 0) {
                if ($(nextTable).hasClass('varformn')) {
                    child.push(table);
                    return await this.getHtmlStart($, nextTable, child);
                } else {
                    child.push(table);
                    return child;
                }
            } else {
                return await this.getHtmlStart($, nextTable, child);
            }
        }
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table 查询到数据的列表块
     * @param {object} data 储存查找到的属性值
     * @desc 查找属性
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
     * @desc 查找特性
     */
    getAbility($, table, data) {
        const childTable = $(table).find('table').find('td');
        data['ability'] = {
            mass: [],
            dream: []
        };
        for (let i = 0; i < childTable.length; i++) {
            const childA = $(childTable[i]).find('a');
            for (let a = 0; a < childA.length; a++) {
                if (i === 0) {
                    data['ability']['mass'].push($(childA[a]).text().trim())
                } else {
                    data['ability']['dream'].push($(childA[a]).text().trim())
                }
            }
        }
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table 查询到数据的列表块
     * @param {object} data 储存查找到的属性值
     * @desc 查找捕获率
     */
    getCapture($, table, data) {
        const childTable = $(table).find('table').find('td');
        const small = $(childTable).find('small');
        const number = $(childTable).text().trim();
        const percent = $(small).text().trim();
        data['capture'] = {
            number: number.replace(percent, ""),
            percent
        };
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table 查询到数据的列表块
     * @param {object} data 储存查找到的属性值
     * @desc 朝朝性别比例
     */
    getSex($, table, data) {
        const childTable = $(table).find('table').find('table');
        const childTr = $(childTable).find('tr');
        const childTd = $(childTr[0]).find('td');
        for (let i = 0; i < childTd.length; i++) {
            const flag = $(childTd[i]).hasClass('hide');
            if (!flag) {
                if (i === 0) {
                    data['sex'] = 0;
                } else if (i === 1) {
                    data['sex'] = 1;
                } else if (i === 2) {
                    const childSpan = $(childTr[1]).find('span');
                    data['sex'] = 3;
                    data['sexPercent'] = {};
                    for (let a = 0; a < childSpan.length; a++) {
                        let text = $(childSpan[a]).text().trim();
                        if (text.indexOf('雄性') !== -1) {
                            text = text.replace('雄性 ', "");
                            data['sexPercent']['man'] = text;
                        } else {
                            text = text.replace('雌性 ', "");
                            data['sexPercent']['woman'] = text;
                        }
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
     * @desc 查找培育方式
     */
    getFoster($, table, data) {
        const childTable = $(table).find('table');
        const childTd = $(childTable).find('td');
        data['foster'] = {
            eggGroup: [],
            cycle: ''
        };
        for (let i = 0; i < childTd.length; i++) {
            if (i === 0) {
                const childA = $(childTd[i]).find('a');
                for (let a = 0; a < childA.length; a++) {
                    data['foster']['eggGroup'].push($(childA[a]).text().trim());
                }
            } else {
                let text = $(childTd[i]).text().trim();
                const end = text.indexOf(' 孵化周期');
                data['foster']['cycle'] = text.slice(0, end);
            }
        }
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table 查询到数据的列表块
     * @param {object} data 储存查找到的属性值
     * @desc 查找基础点
     */
    getBasicPoint($, table, data) {
        const childTable = $(table).find('table');
        const childTr = $(childTable).find('tr');
        for (let i = 0; i < childTr.length; i++) {
            if (i === 0) {
                const childTd = $(childTr[i]).find('td');
                data['basic'] = {};
                for (let a = 0; a < childTd.length; a++) {
                    const childText = $(childTd[a]).text().trim();
                    const text = $(childTd[a]).find('small').text().trim();
                    data['basic'][this.getRacialValueName(a)] = childText.replace(text, "");
                }
            }
        }
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table 查询到数据的列表块
     * @param {object} data 储存查找到的属性值
     * @param {Array} list 种族值的列表
     * @desc 查找种族值
     */
    getRacialValue($, table, data, list) {
        data['racialValue'] = [];
        if ($(table).prop("tagName") === 'DIV') {
            const childTable = $(table).find('.tabbertab');
            for (let a = 0; a < childTable.length; a++) {
                const info = {
                    name: $(childTable[a]).prop("title") ? $(childTable[a]).prop("title") : data[this.getName(1)],
                    value: {}
                };
                const nextChild = $(childTable[a]).find('table.bw-1');
                for (let b = 0; b < nextChild.length; b++) {
                    const nextChildTh = $(nextChild[b]).find('th');
                    info['value'][this.getRacialValueName(b)] = $(nextChildTh[1]).text().trim();
                }
                data['racialValue'].push(info);
            }
        } else {
            const nextChild = $(table).find('table.bw-1');
            const info = {
                name: data['chinaName'],
                value: {}
            };
            for (let b = 0; b < nextChild.length; b++) {
                const nextChildTh = $(nextChild[b]).find('th');
                info['value'][this.getRacialValueName(b)] = $(nextChildTh[1]).text().trim();
            }
            data['racialValue'].push(info);
        }
    }

    /**
     * @method
     * @param {number} index 下标
     * @returns {string} 下标对应的键
     * @desc 根据下标取的该下标的种族值名字
     */
    getRacialValueName(index) {
        switch (index) {
            case 0:
                return 'hp';
            case 1:
                return 'attack';
            case 2:
                return 'defense';
            case 3:
                return 'specialAtk';
            case 4:
                return 'specialDef';
            case 5:
                return 'speed';
            default:
                return 'sum';
        }
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table 查询到数据的列表块
     * @param {object} data 储存查找到的属性值
     * @param {String} name 储存查找到的属性值
     * @desc 查找进化可以学会的招式
     */
    async canLearnMoves($, table, data, name) {
        const tableTr = $(table).find('tbody').find('tr.at-c.bgwhite');
        if (!data['canLearnMoves']) {
            data['canLearnMoves'] = [];
        }
        const childData = [];
        for (let i = 0; i < tableTr.length; i++) {
            const tableTd = $(tableTr[i]).find('td');
            const info = {
                name: '',
                level: '',
                moveId: ''
            };
            const flag = $(tableTd[1]).hasClass('hide');
            for (let a = 0; a < tableTd.length; a++) {
                if (flag) {
                    if (a === 0) {
                        info['level'] = $(tableTd[a]).text().trim();
                    } else if (a === 2) {
                        const text = $(tableTd[a]).find('a').text().trim().toString();
                        info['name'] = text;
                        info['moveId'] = await this.getNameId('item_list', 'china_name', text, 'item_id');
                    }
                } else {
                    if (a === 1) {
                        info['level'] = $(tableTd[a]).text().trim();
                    } else if (a === 2) {
                        const text = $(tableTd[a]).find('a').text().trim().toString();
                        info['name'] = text;
                        info['moveId'] = await this.getNameId('item_list', 'china_name', text, 'item_id');
                    }
                }
            }
            childData.push(info);
        }
        const moves = {
            name: name,
            LearnMoves: childData
        };
        data['canLearnMoves'].push(moves);
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table 查询到数据的列表块
     * @param {object} data 储存查找到的属性值
     * @param {String} name 储存查找到的属性值
     * @desc 查找技能机器可以学习的技能
     */
    async skillMachine($, table, data, name) {
        const tableTr = $(table).find('tbody').find('tr.at-c.bgwhite');
        if (!data['skillMachine']) {
            data['skillMachine'] = [];
        }
        const childData = [];
        for (let i = 0; i < tableTr.length; i++) {
            const tableTd = $(tableTr[i]).find('td');
            const info = {
                name: '',
                moveId: ''
            };
            for (let a = 0; a < tableTd.length; a++) {
                if (a === 2) {
                    const text = $(tableTd[a]).find('a').text().trim();
                    info['name'] = text;
                    info['moveId'] = await this.getNameId('item_list', 'china_name', text, 'item_id');
                }
            }
            childData.push(info);
        }
        const moves = {
            name: name,
            LearnMoves: childData
        };
        data['skillMachine'].push(moves);
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table 查询到数据的列表块
     * @param {object} data 储存查找到的属性值
     * @param {String} name 储存查找到的属性值
     * @desc 查找遗传招式
     */
    async eggSkills($, table, data, name) {
        const tableTr = $(table).find('tbody').find('tr.at-c.bgwhite');
        if (!data['eggSkills']) {
            data['eggSkills'] = [];
        }
        const childData = [];
        for (let i = 0; i < tableTr.length; i++) {
            const tableTd = $(tableTr[i]).find('td');
            const info = {
                name: '',
                moveId: '',
                cousin: []
            };
            for (let a = 0; a < tableTd.length; a++) {
                if(a === 0) {
                    /*const tableA = $(tableTd[a]).find('a').find('span');
                    for (let b = 0; b < tableA.length; b++) {
                        const name = $(tableA[b]).prop('title');
                        const cousin = {
                            name: name,
                            nameId: await this.getNameId('item_list', 'china_name', text, 'item_id')
                        };
                        console.log(cousin);
                    }*/
                }else if (a === 1) {
                    const text = $(tableTd[a]).find('a').text().trim();
                    info['name'] = text;
                    info['moveId'] = await this.getNameId('item_list', 'china_name', text, 'item_id');
                }
            }
            childData.push(info);
        }
        const moves = {
            name: name,
            LearnMoves: childData
        };
        data['eggSkills'].push(moves);
    }

    /**
     * @method
     * @param {function} $ html解析的返回对象
     * @param {jQuery} table 查询到数据的列表块
     * @param {object} data 储存查找到的属性值
     * @param {String} name 储存查找到的属性值
     * @desc 查找遗传招式
     */
    async fixedPointTeaching($, table, data, name) {
        const tableTr = $(table).find('tbody').find('tr.at-c.bgwhite');
        if (!data['fixedPointTeaching']) {
            data['fixedPointTeaching'] = [];
        }
        const childData = [];
        for (let i = 0; i < tableTr.length; i++) {
            const tableTd = $(tableTr[i]).find('td');
            const info = {
                name: '',
                moveId: ''
            };
            for (let a = 0; a < tableTd.length; a++) {
                if (a === 0) {
                    const text = $(tableTd[a]).find('a').text().trim();
                    info['name'] = text;
                    info['moveId'] = await this.getNameId('item_list', 'china_name', text, 'item_id');
                }
            }
            childData.push(info);
        }
        const moves = {
            name: name,
            LearnMoves: childData
        };
        data['fixedPointTeaching'].push(moves);
    }

    /**
     * @method
     * @param {string} listName 数据库表名称
     * @param {string} paramName 数据库键
     * @param {string} id 数据库值
     * @param {string} fieldName 需要查询的字段名字
     * @desc 查找进化可以学会的招式
     */
    async getNameId(listName, paramName, id, fieldName) {
        const moveId = await this.query_specify_field(listName, paramName, id, fieldName);
        if (moveId.length > 0) {
            const {item_id} = moveId[0];
            return item_id;
        } else {
            console.error(id);
            return '无';
        }
    }

}