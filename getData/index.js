/**
 * Created by 圆环之理 on 2018/8/10.
 *
 * 功能：爬取数据的入口位置
 *
 */
'use strict';

const RequestAbility = require("./requestAbility");// 爬取特性列表信息
const RequestProp = require("./requestProp");// 爬取道具列表
const RequestMove = require("./requestMove");// 爬取道具列表

const requestMove = new RequestMove();
const requestAbility = new RequestAbility();
const requestProp = new RequestProp();

module.exports = (time = 604800000) => {
    let index = 0;
    requestMove.start().catch(error => console.log(error));
    setInterval(() => {
        switch (index) {
            case 0:
                requestAbility.start().catch(error => console.log(error));
                index++;
                return;
            case 1:
                requestProp.start().catch(error => console.log(error));
                index++;
                return;
            default:
                requestMove.start().catch(error => console.log(error));
                index = 0;
                return;
        }
    }, time);
};