//import fs from 'fs'
import RegularExampleHtml from '../../regular/common-example/regular-example-html';
import RegularFunctionCommon from '../../regular/common-function/regular-function-common';
import RegularFunctionHtml from '../../regular/common-function/regular-function-html';
import AstHtml from './ast-html';

export default class AstHtmlTemplate extends AstHtml {
    /**
     * 注释内容处理
     * @param name 当前标签的名称
     * @param parseStringR 文本节点匹配的内容
     * @param ty 节点类型
     * @param htmlContent 被解析的HTML内容
     * @param ITS 父节点容器
     * @returns 剩下待解析的内容
     */
    noteParse(name: string, parseStringR: string, ty: THtmlNodeType, htmlContent: string, ITS: IHtml[]): string {
        let [model, htmlContent2] = this.parseSet(name, parseStringR, ty, htmlContent, ITS); htmlContent = htmlContent2;
        model.text = parseStringR;
        this.getTemplateRegisterInfo(parseStringR, (err, registerTagObjs, registerTags) => {
            if (registerTagObjs?.length) {
                registerTagObjs.map(regItem => {
                    model.attr.tagPrefix = regItem.tagPrefix;
                    model.attr.tagName = regItem.tagName;
                    model.attr.src = regItem.src;
                    model.attr.content = '';
                })
            }
        })
        return this.toAstJson(name, htmlContent, ITS);
    }

    /**
     * 获取模板注册信息
     * @param templateContent 模板内容
     * @param resCallBack 引用代码、转换后的对象
     * @returns 
     */
    private getTemplateRegisterInfo(templateContent: string, resCallBack: (error?: string, registerTagObjs?: IHtmlRegisterTag[], registerTags?: string[]) => void) {
        let errorState = false;
        const registerTags = RegularFunctionCommon.results(RegularExampleHtml.noteRegisterTag, templateContent);
        // console.log(registerTags)
        const registerTagObjs: IHtmlRegisterTag[] = registerTags.map(str => {
            if (errorState) return;

            /** 普通标签模板 */
            // let model = RegularFunctionHtml.tagAttrToObject(str) as any;
            // if (model) {
            //     return model;
            // }

            /** 语义标签模板 */
            let model = null;
            model = this.semantemeRegisterTagToModel(str);
            // console.log(model)
            if (model) {
                return model;
            }

            /** 解析失败 */
            errorState = true;
            resCallBack(str.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '：语法错误！');

        }) as any;

        if (errorState) return;

        resCallBack('', registerTagObjs, registerTags);
    }

    /**
     * 根据语义型注册标签获取解析后的对象
     * <!-- @Register 导入“control-type-menu”，使用“uc1”作为标签前缀，使用“Menu”作为标签名。-->
     * <!-- @Register 根据模板“control-type-menu”，自定义<ucwerwerwer1::werweMenu>标签。 -->
     * @param tagContent 
     * @returns 
     */
    semantemeRegisterTagToModel(tagContent: string): IHtmlRegisterTag | null {
        const attrBases = tagContent.match(RegularExampleHtml.noteRegisterTagSemantemeInfo) || [];

        if (attrBases.length == 3) {
            let [src, tagPrefix, tagName] = attrBases;
            return { src, tagPrefix, tagName } as IHtmlRegisterTag;
        }
        return null;
    }
}