/**
 * Created by 圆环之理 on 2018/8/4.
 *
 * 功能：Mysql业务
 *
 */
'use strict';

import db from './db'

export default class ServicesMysql {

    constructor() {
    }

    /**
     * @method
     * @param {string} listName 数据库表名称
     * @desc 根据表名查询数据
     */
    query_data(listName) {
        const sql = `SELECT * FROM ${listName}`;
        return new Promise((resolve, reason) => {
            db.query(sql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    reason(err.message);
                    return;
                }
                console.log('--------------------------SELECT----------------------------');
                resolve(result);
            });
        }).catch(error => {
            console.log('查询全部的数据=>', error);
        });
    };

    /**
     * @method
     * @param {string} listName 数据库表名称
     * @param {string} paramName 数据库键
     * @param {string} id 数据库值
     * @desc 根据列表名和和参数名和参数查询指定数据
     */
    query_specify_data(listName, paramName, id) {
        const sql = `SELECT * FROM ${listName} WHERE ${paramName}='${id}'`;
        console.log(sql);
        //查询数据库
        return new Promise((resolve, reason) => {
            db.query(sql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    reason(err.message);
                    return;
                }
                resolve(result);
            });
        }).catch(error => {
            console.log('获取指定数据=>', error);
        });
    };

    /**
     * @method
     * @param {string} listName 数据库表名称
     * @param {string} paramName 数据库键
     * @param {string} id 数据库值
     * @param {string} fieldName 需要查询的字段名字
     * @desc 根据列表名和和参数名和参数查询指定字段
     */
    query_specify_field(listName, paramName, id, fieldName) {
        const sql = `SELECT ${fieldName} FROM ${listName} WHERE ${paramName}='${id}'`;
        //查询数据库
        return new Promise((resolve, reason) => {
            db.query(sql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    reason(err.message);
                    return;
                }
                resolve(result);
            });
        }).catch(error => {
            console.log('获取指定数据=>', error);
        });
    };

    /**
     * @method
     * @param {String} listName 数据库表名称
     * @param {String} paramName 数据库键
     * @param {Number} startId 数据库值
     * @param {Number} endId 数据库值
     * @desc 查询介于两个参数之间的数据
     */
    query_next_until_data(listName, paramName, startId, endId) {
        const sql = `SELECT * FROM ${listName} WHERE ${paramName} BETWEEN ${startId} AND ${endId};`;
        //查询数据库
        return new Promise((resolve, reason) => {
            db.query(sql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    reason(err.message);
                    return;
                }
                resolve(result);
            });
        }).catch(error => {
            console.log('获取指定数据=>', error);
        });
    };

    /**
     * @method
     * @param {string} listName 数据库表名称
     * @param {string} paramName 数据库键
     * @desc 根据列表名和和参数名查询最后一条数据
     */
    query_specify_last(listName, paramName) {
        const sql = `SELECT * FROM ${listName} ORDER BY ${paramName} DESC LIMIT 1`;
        //查询数据库
        return new Promise((resolve, reason) => {
            db.query(sql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    reason(err.message);
                    return;
                }
                resolve(result);
            });
        }).catch(error => {
            console.log('获取指定数据=>', error);
        });
    };

    /**
     * @method
     * @param {string} sql 数据库表名称
     * @param {Array} param 数据库表名称
     * @returns {object} 是否成功
     * @desc 根据sql语句插入数据，如果主键已存在就更新数据
     */
    append_data(sql, param) {
        db.query(sql, param, function (err, result) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                return;
            }
            console.log('--------------------------INSERT----------------------------');
        });
    };
};