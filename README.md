shtmx 是一个专注于处理 html 模板与 html 模板之前关系的库。最初是为了解决 PrvtCMS 服务端渲染的问题，现在已分离出来作为独立的开源项目。

# 安装

> `npm install shtmx`

---

# 语法

注册（导入）外部组件，创建自定义标签。组件可以来自脚本变量、数据库、本地磁盘等等。

```html
<!-- 组件路径：template/default/control/input/input -->
<input type="text" class="form-control" />
```

```html
<!-- 其它组件引用 -->
<!-- @Register "template/default/control/input/input" to <uc:input> -->

<!-- 案例1 -->
<uc:input></uc:input>
<!-- 最终结果：
    <input type="text" class="form-control" />  
-->

<!-- 案例2 -->
<uc:input class+=" txt-user" disabled></uc:input>
<!-- 最终效果：
    <input type="text" class="form-control txt-user" disabled /> 
-->
```

# 快速上手

母版页-模板（组件） template/default/master/master

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>沧海一站</title>
    <link rel="stylesheet" href="/static/css/reset.css" />
    <!-- header -->
    <template:header></template:header>
    <!-- header -->
  </head>
  <body>
    <!-- bodyer -->
    <template:bodyer></template:bodyer>
    <!-- bodyer -->

    <!-- footer -->
    <template:footer></template:footer>
    <!-- footer -->
  </body>
</html>
```

页头-模板（组件） template/default/control/header/header

```html
<div class="header">
  <ul>
    <li><a href="首页"></a></li>
    <li><a href="企业简介"></a></li>
    <li><a href="市场合作"></a></li>
  </ul>
  <div></div>
</div>
```

页脚-模板（组件） template/default/control/footer/footer

```html
<div class="footer">
  <div class="left">Copyright 2022-2023 g.qb</div>
  <div class="left">by g.qb</div>
</div>
```

首页-模板（组件）

```html
<!-- @Register "template/default/master/master" to <view:master> -->
<!-- @Register "template/default/control/header/header" to <uc:header> -->
<!-- @Register "template/default/control/footer/footer" to <uc:footer> -->
<view:master>
    <master:header>
        <link rel="stylesheet" href="/static/css/index.css" />
    </master:header>
    <master:bodyer>
        <uc:header></uc:header>
        <div>您好，世界！</div>
        <uc:footer></uc:footer>
    </master:bodyer>
    <master:footer>
        <script type="text/javascript" src="/statics/js/index.js">
    </master:footer>
</view:master>
```

插件调用

```js
import SHtmx from "shtmx";
const templates = [
    {
        path: 'index',
        html: 'hello word!'},
];

SHtmx.templateAnalysis({
    templatePath: 'index',
    template: function (path, templateType) {
        let viewContent: string = `未找到“${path}”！`;
        templates.some(item => {
            item.path == path && (viewContent = (item as any)[templateType]);
            return item.path == path;
        });
        return viewContent;
    },
    result: function (viewContent: string): void {
        console.log(viewContent);
    }
});
```

最终效果

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>沧海一站</title>
    <link rel="stylesheet" href="/static/css/reset.css" />
    <!-- header -->
    <link rel="stylesheet" href="/static/css/index.css" />
    <!-- header -->
</head>
<body>
    <!-- bodyer -->
    <div class="header">
        <ul>
            <li><a href="首页"></a></li>
            <li><a href="企业简介"></a></li>
            <li><a href="市场合作"></a></li>
        </ul>
    <div>
    <div>您好，世界！</div>
    <div class="footer">
        <div class="left">Copyright 2022-2023 g.qb</div>
        <div class="left">by g.qb</div>
    </div>
    <!-- bodyer -->

    <!-- footer -->
    <script type="text/javascript" src="/statics/js/index.js">
    <!-- footer -->
</body>
</html>
```
