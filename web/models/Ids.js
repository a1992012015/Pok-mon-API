'use strict';
import mongoose from 'mongoose';
// 在创建表之前我们需要跟大家说一下mongoDB的数据类型，具体数据类型如下：
// 字符串 - 这是用于存储数据的最常用的数据类型。MongoDB中的字符串必须为UTF-8。
// 整型 - 此类型用于存储数值。 整数可以是32位或64位，具体取决于服务器。
// 布尔类型 - 此类型用于存储布尔值(true / false)值。
// 双精度浮点数 - 此类型用于存储浮点值。
// 最小/最大键 - 此类型用于将值与最小和最大BSON元素进行比较。
// 数组 - 此类型用于将数组或列表或多个值存储到一个键中。
// 时间戳 - ctimestamp，当文档被修改或添加时，可以方便地进行录制。
// 对象 - 此数据类型用于嵌入式文档。
// 对象 - 此数据类型用于嵌入式文档。
// Null - 此类型用于存储Null值。
// 符号 - 该数据类型与字符串相同; 但是，通常保留用于使用特定符号类型的语言。
// 日期 - 此数据类型用于以UNIX时间格式存储当前日期或时间。您可以通过创建日期对象并将日，月，年的日期进行指定自己需要的日期时间。
// 对象ID - 此数据类型用于存储文档的ID。
// 二进制数据 - 此数据类型用于存储二进制数据。
// 代码 - 此数据类型用于将JavaScript代码存储到文档中。
// 正则表达式 - 此数据类型用于存储正则表达式。

//创建表（Ids）
const idsSchema = new mongoose.Schema({
    restaurant_id: Number,
    food_id: Number,
    order_id: Number,
    user_id: Number,
    address_id: Number,
    cart_id: Number,
    img_id: Number,
    category_id: Number,
    item_id: Number,
    sku_id: Number,
    admin_id: Number,
    statis_id: Number
});

/**
 * 下一步在代码中使用Schema所定义的数据模型，需要将定义好的phoneSchema转换为Model。
 可以使用mongoose.model(modelName, schema)进行转换。
 在Mongoose的设计理念中，Schema用来也只用来定义数据结构，具体对数据的增删改查操作都由Model来执行
 */

const Ids = mongoose.model('Ids', idsSchema);

Ids.findOne((err, data) => {
    if (!data) {
        const newIds = new Ids({
            restaurant_id: 0,
            food_id: 0,
            order_id: 0,
            user_id: 0,
            address_id: 0,
            cart_id: 0,
            img_id: 0,
            category_id: 0,
            item_id: 0,
            sku_id: 0,
            admin_id: 0,
            statis_id: 0
        });
        newIds.save().then(res => {
            console.log('创建数据库', res);
        }); //保存数据
    }
});

export default Ids;