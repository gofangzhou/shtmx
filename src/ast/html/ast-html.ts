import RegularExampleHtml from "../../regular/common-example/regular-example-html";
import RegularFunctionCommon from "../../regular/common-function/regular-function-common";

class parseMap {
    static readonly reg: any = {
        element: RegularExampleHtml.element,
        elementEnd: RegularExampleHtml.elementEnd,
        note: RegularExampleHtml.note,
        declare: RegularExampleHtml.doctype,
        text: RegularExampleHtml.text,
    }
    static forEach(callback: (value: RegExp, key: THtmlNodeType) => void): void {
        Object.keys(this.reg).map(key => callback(this.reg[key], key as any));
    }
    static get(key: string) {
        return this.reg[key];
    }
}

export default class AstHtml {
    _htmlContent: string = ''
    constructor() {
        //this._htmlContent = htmlContent;
    }

    /**
     * HTML 转 语法树
     * @param htmlContent 指定HTML内容或NEW时的内容
     * @returns 语法树
     */
    htmlToAstJson(htmlContent: string) {
        let res: IHtml[] = [];
        this.toAstJson('', htmlContent, res);
        return res;
    }

    /**
     * 根据HTML内容返回语法树
     * @param name 父节点标签名称，根节点为空字符串
     * @param htmlContent 被解析的HTML内容
     * @param ITS 父节点容器
     * @returns 空字符串或待解析的内容
     */
    toAstJson(name: string, htmlContent: string, ITS: IHtml[]): string {
        parseMap.forEach((value, key: THtmlNodeType) => {
            if (key !== 'elementEnd') {
                let parseStringR = RegularFunctionCommon.firstResult(value, htmlContent);
                if (parseStringR.length) {
                    htmlContent = this.parseNext(name, parseStringR, key, htmlContent, ITS);
                }
            }
        })
        let parseStringR = RegularFunctionCommon.firstResult(parseMap.get('element'), htmlContent);
        if (parseStringR.length) return this.toAstJson(name, htmlContent, ITS);
        return htmlContent;
    }

    /**
     * 结束标签处理。
     * @param name 当前标签的名称
     * @param parseStringR 结束标签匹配的内容
     * @param ty 节点类型
     * @param htmlContent 被解析的HTML内容
     * @param ITS 父节点容器
     * @returns 剩下待解析的内容，如果是当前标签结束，则移除结束标签，否则递归返回到上一层处理，直到找到自己。
     */
    elementEndParse(name: string, parseStringR: string, ty: THtmlNodeType, htmlContent: string, ITS: IHtml[]): string {
        return name == RegularFunctionCommon.firstResult(RegularExampleHtml.tagName, parseStringR) ? htmlContent.replace(parseStringR, '') : htmlContent;
    }

    /**
     * 开始标签及属性
     * @param name 当前标签的名称
     * @param parseStringR 结束标签匹配的内容
     * @param ty 节点类型
     * @param htmlContent 被解析的HTML内容
     * @param ITS 父节点容器
     * @returns 剩下待解析的内容，移除了开始标签<>及之间的内容。
     */
    elementParse(name: string, parseStringR: string, ty: THtmlNodeType, htmlContent: string, ITS: IHtml[]): string {
        let [model, htmlContent2] = this.parseSet(name, parseStringR, ty, htmlContent, ITS); htmlContent = htmlContent2;
        let _name = RegularFunctionCommon.firstResult(RegularExampleHtml.tagName, parseStringR);
        model.name = _name;
        if (/:/.test(_name)) {
            let [tagPrefix, tagName] = _name.match(/[^:]+/g) || ['', ''];
            tagPrefix && (model.tagPrefix = tagPrefix);
            tagName && (model.tagName = tagName);
        }

        RegularFunctionCommon.results(RegularExampleHtml.elementAttrs, parseStringR).map(str => {
            let [attrKey, attrVal] = RegularFunctionCommon.results(RegularExampleHtml.elementAttrKeyValue, str);
            model.attr[attrKey as any] = attrVal || '';
        })

        if (!/^(meta|input|link|hr|br|img)$/.test(_name) && !/[\\\/]+>$/.test(parseStringR)) {
            model.chid = [];

            if (/style|script/.test(_name)) {
                let textEnd = htmlContent.indexOf(`</${_name}`);
                model.chid.push({ nodeType: 'text', text: htmlContent.substring(0, textEnd) });
                htmlContent = htmlContent.substring(textEnd);
            }

            htmlContent = this.toAstJson(_name, htmlContent, model.chid);

            parseStringR = RegularFunctionCommon.firstResult(parseMap.get('elementEnd'), htmlContent);
            if (parseStringR) {
                htmlContent = this.parseNext(_name, parseStringR, 'elementEnd', htmlContent, model.chid);
            }
        }
        return htmlContent;
    }


    /**
     * 文本节点处理
     * @param name 当前标签的名称
     * @param parseStringR 文本节点匹配的内容
     * @param ty 节点类型
     * @param htmlContent 被解析的HTML内容
     * @param ITS 父节点容器
     * @returns 剩下待解析的内容
     */
    textParse(name: string, parseStringR: string, ty: THtmlNodeType, htmlContent: string, ITS: IHtml[]): string {
        let [model, htmlContent2] = this.parseSet(name, parseStringR, ty, htmlContent, ITS); htmlContent = htmlContent2;
        model.text = parseStringR;
        return this.toAstJson(name, htmlContent, ITS);
    }

    parseSet(name: string, parseStringR: string, ty: THtmlNodeType, htmlContent: string, ITS: IHtml[]): [IHtml, string] {
        let model: IHtml = { nodeType: ty, attr: {} };
        htmlContent = htmlContent.replace(parseStringR, '');
        if (!/^[\r\s\n]+\s+$/.test(parseStringR)) ITS.push(model);
        return [model, htmlContent];
    }

    parseNext(name: string, parseStringR: string, ty: THtmlNodeType, htmlContent: string, ITS: IHtml[]): string {
        const that = this as any;
        let callBackName = `${ty}Parse`;
        !that[callBackName] && (callBackName = 'textParse');
        return that[callBackName] && that[callBackName](name, parseStringR, ty, htmlContent, ITS)
    }
}