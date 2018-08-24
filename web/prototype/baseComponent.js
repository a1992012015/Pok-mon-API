/**
 * Created by 圆环之理 on 2018/8/22.
 *
 * 功能：
 *
 */
'use strict';

import fetch from 'node-fetch';
import formidable from 'formidable'; //表单处理
import path from 'path';
import fs from 'fs';
import Ids from '../models/ids';
import qiniu from 'qiniu'; //七牛云

qiniu.conf.ACCESS_KEY = 'Ep714TDrVhrhZzV2VJJxDYgGHBAX-KmU1xV1SQdS';
qiniu.conf.SECRET_KEY = 'XNIW2dNffPBdaAhvm9dadBlJ-H6yyCTIJLxNM_N6';

export default class BaseComponent {
    //构造函数是一种特殊的方法。主要用来在创建对象时初始化对象， 即为对象成员变量赋初始值
    constructor() {
        this.idList = ['restaurant_id', 'food_id', 'order_id', 'user_id', 'address_id', 'cart_id', 'img_id', 'category_id', 'item_id', 'sku_id', 'admin_id', 'statis_id'];
        this.imgTypeList = ['shop', 'food', 'avatar', 'default'];
        this.uploadImg = this.uploadImg.bind(this);
        this.qiniu = this.qiniu.bind(this);
    }

    //async是异步处理
    async fetch(url = '', data = {}, type = 'GET', resType = 'JSON') {
        type = type.toUpperCase(); //所有小写字符全部被转换为了大写字符
        resType = resType.toUpperCase();
        if (type === 'GET') {
            let dataStr = ''; //数据拼接字符串
            Object.keys(data).forEach(key => {
                dataStr += key + '=' + data[key] + '&';
            });
            if (dataStr !== '') {
                dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
                url = url + '?' + dataStr; //拼接URL地址
            }
        }
        let requestConfig = {
            method: type,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        if (type === 'POST') {
            Object.defineProperty(requestConfig, 'body', {value: JSON.stringify(data)})
        }

        let responseJson;
        try {
            const response = await fetch(url, requestConfig);
            if (resType === 'TEXT') {
                responseJson = await response.text();
            } else {
                responseJson = await response.json();
            }
        } catch (err) {
            console.log('获取http数据失败:' + err);
            throw new Error(err);
        }
        return responseJson;
    }

    //获取ID列表
    async getId(type) {
        console.log('getId');
        if (!this.idList.includes(type)) {
            console.log('id类型错误');
            throw new Error('id类型错误');
        }
        try {
            console.log('start-findOne');
            const idData = await Ids.findOne();
            console.log('findOne');
            idData[type]++;
            await idData.save();
            return idData[type];
        } catch (err) {
            console.log('获取ID数据失败:' + err);
        }
    }

    //图片上传
    async uploadImg(req, res, next) {
        const type = req.params.type;
        try {
            const image_path = await this.qiniu(req, type);
            res.send({
                status: 1,
                image_path,
            });
        } catch (err) {
            console.log('图片上传失败:' + err);
            res.send({
                status: 0,
                type: 'ERROR_UPLOAD_IMG',
                message: '图片上传失败'
            });
        }
    }

    async qiniu(req, type = 'default') {
        return new Promise((resolve, reject) => {
            const form = formidable.IncomingForm();
            form.uploadDir = './public/img/' + type;
            form.parse(req, async (err, fields, files) => {
                let img_id;
                try {
                    img_id = await this.getId('img_id');
                } catch (err) {
                    console.log('获取图片ID失败');
                    fs.unlink(files.file.path);
                    reject('获取图片ID失败');
                }
                const imgName = (new Date().getTime() + Math.ceil(Math.random() * 10000)).toString(16) + img_id;
                const extname = path.extname(files.file.name);
                const repath = './public/img/' + type + '/' + imgName + extname;
                try {
                    const key = imgName + extname;
                    await fs.rename(files.file.path, repath);
                    const token = this.uptoken('node-element', key);
                    const qiniuImg = await this.uploadFile(token.toString(), key, repath);
                    fs.unlink(repath);
                    resolve(qiniuImg);
                } catch (err) {
                    console.log('保存至七牛失败' + err);
                    fs.unlink(files.file.path);
                    reject('保存至七牛失败');
                }
            })
        })
    }

    //获取TOKEN
    uptoken(bucket, key) {
        const putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + key);
        return putPolicy.token();
    }

    //上传图片
    uploadFile(uptoken, key, localFile) {
        return new Promise((resolve, reject) => {
            const extra = new qiniu.io.PutExtra();
            qiniu.io.putFile(uptoken, key, localFile, extra, function (err, ret) {
                if (!err) {
                    resolve(ret.key);
                } else {
                    console.log('图片上传至七牛失败' + err);
                    reject(err);
                }
            })
        });
    }
}
