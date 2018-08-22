/**
 * Created by admin on 2017/9/28 0014.
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