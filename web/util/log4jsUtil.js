/**
 * Created by 圆环之理 on 2018/8/22.
 *
 * 功能：日志功能
 *
 */

import * as log4js from 'log4js';

/**
 * 获取日期
 */
const getDateTime = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
};

log4js.configure({
    appenders: {
        out: {
            type: 'stdout'
        },//设置是否在控制台打印日志
        info: {
            type: 'file',
            filename: `./logs/${getDateTime()}-info.log`
        }
    },
    categories: {
        default: {
            appenders: ['out', 'info'],
            level: 'info'
        }//去掉'out'。控制台不打印日志
    }
});

const logger = log4js.getLogger('info');

export default class LogInfo {

    constructor() {
    }

    /**
     * 正常日志记录
     * @param message 日志内容
     */
    info(message) {
        logger.info(message);
    }

    /**
     * 调试日志记录
     * @param message 日志内容
     */
    debug(message) {
        logger.debug(message);
    }

    /**
     *
     * @param message 日志内容
     */
    trace(message) {
        logger.trace(message);
    };

    /**
     * 告警日志记录
     * @param message 日志内容
     */
    warn(message) {
        logger.warn(message);
    };

    /**
     * 错误日志记录
     * @param message 日志内容
     */
    error(message) {
        logger.error(message);
    };

    /**
     *
     * @param message
     */
    fatal(message) {
        logger.fatal(message);
    };
}