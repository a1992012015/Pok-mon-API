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
import RequestIllustrations from './requestPokemon';// 爬取道具列表

const requestItem = new RequestItem();
const requestAbility = new RequestAbility();
const requestProp = new RequestProp();
const requestIllustrations = new RequestIllustrations();

export default async function(time = 604800000, index = 0) {// 604800000
    console.log('开始爬取数据');
    await requestIllustrations.start();
    setInterval(async function() {
        switch (index) {
            case 0:
                await requestAbility.start();
                index++;
                return;
            case 1:
                await requestProp.start();
                index++;
                return;
            default:
                await requestItem.start();
                index = 0;
                return;
        }
    }, time);
};