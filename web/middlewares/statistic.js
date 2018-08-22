/**
 * Created by 圆环之理 on 2018/8/22.
 *
 * 功能：
 *
 */
'use strict';

import dtime from 'time-formater'; //日期格式化
import BaseComponent from '../prototype/baseComponent';
import StatisModel from '../models/statis/statis';

class Statistic extends BaseComponent {
    //构造函数
    constructor() {
        super(); //可以表示构造函数传递。this(a,b)表示调用另外一个构造函数
        this.apiRecord = this.apiRecord.bind(this);
    }

    async apiRecord(req, res, next) {
        try{
            const statis_id = await this.getId('statis_id');
            const apiInfo = {
                date: dtime().format('YYYY-MM-DD'), //日期格式化
                origin: req.headers.origin,
                id: statis_id
            };
            StatisModel.create(apiInfo);
        } catch(err) {
            console.log('API数据出错',err);
        }
        next()
    }
}

export default new Statistic();