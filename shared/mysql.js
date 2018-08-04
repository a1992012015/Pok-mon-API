const mysql  = require('mysql');

const connection = mysql.createConnection({
    host     : '119.27.168.74',
    user     : 'root',
    password : 'mengyehuanyu123.',
    port: '3306',
    database: 'pokemon'
});

connection.connect();

class servicesMysql {

    constructor() { }

    /**
     * @method
     * @param {string} listName 数据库表名称
     * @returns {object} 表的全部数据
     * @desc 根据表名查询数据
     */
    query_data(listName) {
        const  sql = `SELECT * FROM ${listName}`;
        connection.query(sql,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
                return;
            }
            console.log('--------------------------SELECT----------------------------');
            // console.log(result);
            // console.log('------------------------------------------------------------\n\n');
            return result;
        });
    };

    /**
     * @method
     * @param {string} listName 数据库表名称
     * @param {string} paramName 数据库表名称
     * @param {string} id 数据库表名称
     * @returns {object} 表的全部数据
     * @desc 根据列表名和和参数名和id查询指定数据
     */
    query_specify_data (listName, paramName, id) {
        const  sql = `SELECT * FROM ${listName} WHERE ${paramName}=${id}`;
        //查询数据库
        connection.query(sql,function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
                return;
            }
            return result;
        });
    };

    /**
     * @method
     * @param {string} sql 数据库表名称
     * @param {Array} param 数据库表名称
     * @returns {object} 是否成功
     * @desc 根据sql语句插入数据，如果主键已存在就更新数据
     */
    append_data (sql, param) {

        connection.query(sql, param, function (err, result) {
            if(err){
                console.log('[INSERT ERROR] - ',err.message);
                return;
            }

            console.log('--------------------------INSERT----------------------------');
            // console.log('INSERT ID:',result.insertId);
            // console.log('INSERT ID:',result);
            // console.log('-----------------------------------------------------------------\n\n');
        });
    };
}

module.exports = servicesMysql;