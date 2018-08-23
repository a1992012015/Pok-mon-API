/**
 * Created by 圆环之理 on 2018/8/5.
 *
 * 功能：layout页面JS
 *
 */
'use strict';

const like = {1: '赵春梅', 2: '李丹', 3: '贺静'};
console.log(like);

$(function () {
    $('.name').hover(function () {
        $(this).css('background-color', 'yellow');
    }, function () {
        $(this).css('background-color', 'transparent');
    });
});
