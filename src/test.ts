import SHtmx from "./index";


const templates = [
    {
        path: 'template/default/master/master',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
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
        `
    },
    {
        path: 'template/default/control/header/header', html: `
        <div class="header">
            <ul>
                <li><a href="首页"></a></li>
                <li><a href="企业简介"></a></li>
                <li><a href="市场合作"></a></li>
            </ul>
        <div>
    ` },
    {
        path: 'template/default/control/footer/footer', html: `
        <div class="footer">
            <div class="left">Copyright 2022-2023 g.qb</div>
            <div class="left">by g.qb</div>
        </div>
    ` },
    {
        path: 'index', html: `
        <!-- @Register "template/default/master/master" to <view:master> -->
        <!-- @Register "template/default/control/header/header" to <uc:header> -->
        <!-- @Register "template/default/control/footer/footer" to <uc:footer> -->
        <view:master>
            <master:header>
                <link rel="stylesheet" href="/static/css/index.css" />
            </master:header>
            <master:bodyer>
                <uc:header></uc:header>
                <div :class="abc">您好，世界！</div>
                <uc:footer></uc:footer>
            </master:bodyer>
            <master:footer>
                <script type="text/javascript" src="/statics/js/index.js">
            </master:footer>
        </view:master>
    ` }
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
    result: function (viewContent: string, templateNames): void {
        console.log(viewContent)
        console.log(templateNames);
    }
});