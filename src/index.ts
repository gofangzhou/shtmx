import AstHtml from "./ast/html/ast-html"
import AstHtmlTemplateView from "./ast/html/ast.html.template.view"

interface ISHtmxMvcTagAttr {
    value: string
    for: string
    if: string
    elseif: string
    else: string
    class: string
    css: string
    attr: string

    click?: string
    dblclick?: string

    mousedown?: string
    mousemove?: string
    mouseout?: string
    mouseover?: string
    mouseup?: string

    keydown?: string
    keyup?: string
}

interface ISHtmxMvc {
    enable: boolean
    attributeName: ISHtmxMvcTagAttr
}

interface ISHtmxSetting {
    templatePath: string
    mvc?: ISHtmxMvc,
    template: (templatePath: string, templateType: 'html') => string
    result: (viewContent: string, templateNames: string[]) => void
}

export default class SHtmx {

    constructor() {

    }

    /**
     * HTML 转 语法树
     * @param htmlContent 指定HTML内容或NEW时的内容
     * @returns 语法树
     */
    static htmlToAstJson(htmlContent: string) {
        return new AstHtml().htmlToAstJson(htmlContent);
    }

    /**
     * 解析模板
     * @param settings 配置
     * @returns 
     */
    static templateAnalysis(settings: ISHtmxSetting) {
        const templateNames = [];
        const astHtmlTemplate = new AstHtmlTemplateView();
        if (settings.mvc?.enable) {
            astHtmlTemplate.openMvc = true;
        }

        const viewContent = settings.template(settings.templatePath, 'html');

        templateNames.push(settings.templatePath);
        const res = astHtmlTemplate.htmlToAstJson(viewContent);
        const model2: IHtmlControlNodeOfDataInfo = {
            controlRegisterPath: settings.templatePath,
            controlNodeLeve: 1,
            controlRegisterNodeLeve: 0,
            controlId: "",
            controllerDataNodeParentPath: "",
            controllerDataNodeLeve: 0,
            controllerDataNodePath: "",
            controllerDataNodeChildLeve: 0,
            controllerDataNodeType: ""
        };

        let resultContent = astHtmlTemplate.astJsonToHtml(res, (model: any) => {
            templateNames.push(model.src);
            const content = settings.template(model.src, 'html');
            return astHtmlTemplate.htmlToAstJson(content);
        }, model2);

        settings.result(resultContent, templateNames);
    }
}