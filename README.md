# Pokemon-API

爬取数据

```
├── bin
│   │
│   └── www => 项目启动文件
│
├── config => 项目基本配置，主要配置项目的接口、SESSION、Cookie等信息
│   │
│   └── default.js => 默认配置
│   │
│   └── development.js => 开发环境配置
│
├── initData => 项目的基础数据，包括城市数据等等
│   │
│   └── name.json => 李丹的数据
│
├── logs => 日志目录，存放系统生成的日志信息
│   │
│   └── *-error.log => 错误的日志
│   │
│   └── *-success.log => 正常的日志
│   │
│   └── info.log => 一般的信息记录
│
├── public => 存放img、js、css等等
│   │
│   └── images => 图片文件夹
│   │
│   └── js => js存放文件夹
│   │
│   └── stylesheets => css样式存放文件夹
│
├── routes => 存放系统路由信息
│   │
│   └── index.js => 路由配置信息
│
├── screenshot => 这个文件夹我创建的作用是存放临时文件，可有可无
│   │
│   └── index.markdown
│
├── view => 前端页面存放的位置
│
├── web => 网站的核心内容，包括controller、model、mongoose等等
│   │
│   └── controller => 控制器 主要连接模型和视图
│   │
│   └── middlewares => 项目中间件
│   │
│   └── models => 系统模型，主要编写数据库表结构、部分逻辑处理
│   │
│   └── mySql => 数据库信息
│   │
│   └── prototype => 编写公共组件。比如百度地图的API、表单处理、图片上传等等
│   │
│   └── util => 自定义目录，目前只存放了日志文件
│
├── app.js => 项目启动入口
│
├── .babelrc => ES6转换配置文件
│
├── .gitignore => git忽略配置文件
│
├── cmd.dat => 这是控制台命令
│
├── package.json
│
└── README.md
```