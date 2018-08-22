/**
 * Created by 圆环之理 on 2018/8/10.
 *
 * 功能：爬取数据的入口位置
 *
 */
'use strict';

import RequestAbility from './requestAbility';// 爬取特性列表信息
import RequestProp from './requestProp';// 爬取道具列表
import RequestItem from './requestItem';// 爬取道具列表

const requestItem = new RequestItem();
const requestAbility = new RequestAbility();
const requestProp = new RequestProp();

export default (time = 604800000, index = 0) => {
    requestItem.start().catch(error => console.log(error));
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
                requestItem.start().catch(error => console.log(error));
                index = 0;
                return;
        }
    }, time);
};