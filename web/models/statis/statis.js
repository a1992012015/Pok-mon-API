/**
 * Created by 圆环之理 on 2018/8/22.
 *
 * 功能：
 *
 */
'use strict';

import mySql from 'mysql';
const Schema = mySql.Schema;

const statisSchema = new Schema({
    date: String,
    origin: String,
    id: Number
});

statisSchema.index({id: 1});

const Statis = mysql.model('Statis',statisSchema);

export default Statis;