import Common from "../../common/common";
import RegularFunctionCommon from "../../regular/common-function/regular-function-common";
import RegularFunctionHtml from "../../regular/common-function/regular-function-html";
import AstHtmlTemplate from "./ast.html.template";
// import fs from 'fs'

let cCount: number = 0;
export default class AstHtmlTemplateView extends AstHtmlTemplate {
    /**
     * 是否开启控件脚本功能
     */
    openControlJs = false;
    /** 是否开启mvc */
    openMvc = false;
    count: number = 0;

    /**
     * Tree结构转字符串
     * @param models 实体集合
     * @param callback 接受节点处理结果的函数
     * @param childCode 子项属性名称
     * @returns 处理结果
     */
    treeToString<T>(models: T[], callback: (modelItem: T) => [tagBeforeText: string, TagAfterText: string], childCode: string = 'chid'): string {
        if (!models || !models.length) return '';
        return models.map((item: any) => {
            const [beforeText, afterText] = callback(item);
            const childContent = (item[childCode] && item[childCode].length) ? (this.treeToString(item[childCode], callback, childCode)) : '';
            return beforeText + childContent + (afterText || '');
        }).join('')
    }

    htmlAstToHtmlPretreatment(htmlAstModels: IHtml[] = [], parentNodeInfo: IHtml = {}, count: number) {
        return htmlAstModels?.map(item => {
            if (item.tagPrefix && item.tagPrefix != 'template') {
                if (parentNodeInfo.tagName != item.tagPrefix) {
                    item.controlRegisterLevel = ++count;
                }
            }
            else {
                if (item.controlRegisterLevel === undefined)
                    item.controlRegisterLevel = this.count
            }
            this.htmlAstToHtmlPretreatment(item.chid, item, count);
        }).join('') || '';
    }

    /**
     * html语法树转Html文本
     * @param htmlAstModels 语法树
     * @param queryCustomElementFn 获取自定义标签的语法树
     * @param parentNodeInfo 
     * @param registerTagAstModel 
     * @returns 
     */
    astJsonToHtml(htmlAstModels: IHtml[] = [], queryCustomElementFn: (model: IHtml) => IHtml[], parentNodeInfo: IHtmlControlNodeOfDataInfo, registerTagAstModel: IHtml = {}): string {

        const controlLevel = registerTagAstModel.controlLevel || 0;
        if (controlLevel < 1) {
            cCount++;
            this.count = (registerTagAstModel?.controlRegisterLevel || 0);
            this.htmlAstToHtmlPretreatment(htmlAstModels, registerTagAstModel, this.count);
        }


        const that = this as any;
        !parentNodeInfo.controllerControlIdAndPathDic && (parentNodeInfo.controllerControlIdAndPathDic = {});

        const registerInfo = htmlAstModels.filter(item => /^[\s\n]*<!--\s*@Reg/.test(item.text || ''));
        const viewInfo = htmlAstModels.filter(item => !/^[\s\n]*<!--\s*@Reg/.test(item.text || ''));

        return this.treeToString<IHtml>(viewInfo, (item: any) => {

            // 数据
            item.controlDomLevel ||= parentNodeInfo.controlNodeLeve;
            item.controllerLevel ??= parentNodeInfo.controllerDataNodeLeve;
            item.controllerDomChildLevel ??= item.controllerLevel;
            item.attr ??= {};

            item.chid && item.chid.map((child: IHtml) => {
                child.controlDomLevel = (item.controlDomLevel as number) + 1;
                child.controllerLevel = item.controllerLevel;
                item.controllerDomChildLevel = (item.controllerLevel || 0) + (item.attr[':for'] ? 1 : 0);
            });

            // 基础变量
            // const controlId = 'ID' + item.controlRegisterLevel;
            // item.attr['control-id'] = controlId;
            // item.attr['dom-level'] = item.controlDomLevel;
            // item.attr['controlRegisterLevel'] = item.controlRegisterLevel || 0;


            const strBefore = '\n' + new Array(item.controlDomLevel).join('  ');

            if (item.nodeType == 'declare') return [item.text, ''];
            if (item.nodeType == 'note') return [strBefore + item.text, ''];

            if (item.nodeType == 'text') {
                let text: string = item.text || '';
                text = text.replace(/(?<=\{\{)[^\{\}]+(?=\}\})/g, str => this.controllerDataInfoBindParse(str, item, registerTagAstModel as IHtml));
                return [text, ''];
            }

            let beforeText = `<${item.name}{0}>`;
            let afterText = `</${item.name}>` + strBefore.replace('  ', '');

            if (/meta|link|img|input|hr|br/i.test(item.name || '')) {
                beforeText = `<${item.name}{0} />` + strBefore.replace('  ', '');
                afterText = '';
            }

            if (item.tagName && item.tagPrefix) {
                const regControl = registerInfo.filter(reg => reg.attr.tagName == item.tagName && reg.attr.tagPrefix == item.tagPrefix);
                if (regControl.length) {
                    const registerControlAsts = queryCustomElementFn({ src: regControl[0].attr.src } as any);
                    (item as any).src = regControl[0].attr.src;

                    const nodeInfo = { ...parentNodeInfo };
                    nodeInfo.controlNodeLeve = item.controlDomLevel;
                    nodeInfo.controllerDataNodeLeve = item.controllerLevel;

                    if (item.chid) {
                        registerControlAsts.filter(rca => rca.nodeType == 'element').filter((rca, rci) => rci == 0).map(rca => {

                            /**
                             * <uc:master><master:Content ContentSlotID="header" /></uc:master>
                             * // && /content/i.test(cd.tagName || ''));
                             * <uc:master><master:header /></uc:master>
                             */
                            const checkSlot = item.chid && item.chid.some((cd: any) => cd.tagPrefix == item.tagName);
                            if (checkSlot) {

                                item.chid && item.chid.map((cd: any) => {

                                    /** 
                                     * 遍历引用模板的所有标签，找到匹配的插槽。 
                                     * //Content(Slot|PlaceHolder)/i.test(templateModel.tagName || '');
                                     * */
                                    this.forAstJsonNode(registerControlAsts, templateModel => {
                                        let contentSlotTag = /template/i.test(templateModel.tagPrefix || '');
                                        let contentSlot_ID = cd.attr['ContentSlotID'] || cd.attr['ContentPlaceHolderID'] || cd.tagName;
                                        let contentSlot_ID_Chk = (templateModel.attr?.ID || templateModel.tagName) == contentSlot_ID;
                                        if (contentSlotTag && contentSlot_ID_Chk) {


                                            // console.log('==========================================');
                                            // console.log(JSON.stringify(templateModel));
                                            // console.log(cd);




                                            this.forAstJsonNode(cd.chid, beforeModel => {
                                                if (beforeModel.tagPrefix) {

                                                }
                                                else {
                                                    (beforeModel as any).src = parentNodeInfo.controlRegisterPath;
                                                }
                                                return true;
                                            })


                                            if (cd.attr && cd.attr['class+']) {
                                                try {
                                                    (templateModel as any).chid[0].attr.class += cd.attr['class+']
                                                }
                                                catch (er) {

                                                }

                                                try {

                                                    if (cd.attr['class[0]+']) {
                                                        (templateModel as any).chid[0].chid[0].attr.class += cd.attr['class[0]+'];
                                                    }
                                                }
                                                catch (er) {

                                                }

                                            }
                                            else {
                                                templateModel.chid = cd.chid;
                                            }
                                        }
                                        return true;
                                    })
                                })
                            }
                            else if (item.chid && item.chid.length) {
                                rca.chid = item.chid;
                            }

                            Object.keys(item.attr).map(key => {
                                const attrKey = key.replace(/\+$/, '');
                                if (/\+$/.test(key)) {
                                    rca.attr[attrKey] += item.attr[key];
                                }
                                else {
                                    //console.log(attrKey, key);
                                    rca.attr[attrKey] = item.attr[key];
                                }
                            })
                        })
                    }

                    let registerControlAstTos: IHtml[] = [];
                    const rcat1 = registerControlAsts.filter(rca => /^[\s\n]*<!--\s*@Reg/.test(rca.text || ''));
                    const rcat3 = registerControlAsts.filter(rca => !/^[\s\n]*<!--\s*@Reg/.test(rca.text || ''));
                    registerControlAstTos = [...rcat1, ...registerInfo, ...rcat3];
                    //nodeInfo.controlRegisterNodeLeve = ++this.count;
                    const astHtmlTemplate = new AstHtmlTemplateView();
                    astHtmlTemplate.openControlJs = this.openControlJs;
                    astHtmlTemplate.openMvc = this.openMvc;

                    const content = astHtmlTemplate.astJsonToHtml(registerControlAstTos, queryCustomElementFn, nodeInfo, item);
                    item.chid = undefined;
                    return [content, ''];
                }
                else {

                    if (item.tagPrefix == 'template') {//} && item.tagName == 'ContentSlot') {
                        return ['', ''];
                    }
                    else {
                        return [item.name, '： 未注册。'];
                        // console.log(item.name + '： 未注册。');
                    }
                }
            }

            let attrContents: string[] = Object.keys(item.attr).map(key => {
                let [_key, fsName, attrValue] = [key, `attr[]Parse`, (item as any).attr[key]];
                if (that[fsName]) (attrValue = that[fsName](key, item, registerTagAstModel));
                if (Common.isType(attrValue, 'Array')) {
                    //console.log(attrValue)
                    let [attrName, attrVal] = attrValue;
                    _key = attrName;
                    attrValue = attrVal;
                }
                return ` ${_key}="${attrValue}"`;
            })

            beforeText = strBefore + beforeText;

            return [Common.stringFormat(beforeText, attrContents.join('')), afterText + (item.afterContent || '')];
        });
    }

    /**
     * 遍历语法树，查找指定节点
     * @param htmlAstModels html语法树
     * @param findSucc 当前节点回调函数
     * @returns 是否查找成功
     */
    queryAstJsonNode(htmlAstModels: IHtml[] = [], findSucc: (model: IHtml) => boolean): IHtml | null {
        let i = 0;
        const j = htmlAstModels.length;
        for (; i < j; i++) {
            const model = htmlAstModels[i];
            let findState: any = findSucc(model);
            if (findState) {
                return model;
            }

            findState = this.queryAstJsonNode(model.chid, findSucc);
            if (findState) {
                return findState;
            }
        }
        return null;
    }

    /**
     * 遍历语法树
     * @param htmlAstModels html语法树
     * @param findToChild 当前节点回调函数
     * @returns 是否继续遍历子项
     */
    forAstJsonNode(htmlAstModels: IHtml[] = [], findToChild: (model: IHtml) => boolean): boolean {
        let i = 0;
        const j = htmlAstModels.length;
        for (; i < j; i++) {
            const model = htmlAstModels[i];
            let findState: any = findToChild(model);
            if (findState) {
                this.forAstJsonNode(model.chid, findToChild);
            }
        }
        return false;
    }

    controllerDataInfoBindParse(str: string, item: IHtml, parentItem: IHtml) {
        str = str.replace(/((['"]{1}).*?(?<=[^\\])\2|(?<=(^|[\(\s,\+\-\*\/\?\:]))([^,;\s\+\-\*\/\(\)\'\"\=\.\?]+))/gi, str => {
            if (/^['"]/.test(str)) return str;
            if (str == '$event') return str;
            if (/^\$/.test(str)) return `$index_` + item.controllerDomChildLevel;
            if (/^(\@|el)/.test(str)) return `@el_` + item.controllerDomChildLevel;
            return str;
        })
        const controlId = 'ID' + item.controlRegisterLevel;
        str = str.replace(/[a-zA-Z0-9_]+\(/g, str => {
            const fnName = str.replace('(', '');
            let src = '';
            try {
                src = (item as any).src || (parentItem as any).src || '';
            }
            catch {

            }

            //src == '' || src == 'view-index'
            if (src == '' || item.controlRegisterLevel === 0) {
                return str;
            }

            if (!this.openControlJs) {
                return str;
            }
            return parentItem ? `excuteFn('${src}','${controlId}','${fnName}',` : str;
        });
        return str;
    }



    "attr[]Parse"(key: string, item: IHtml, parentItem: IHtml) {

        item.controllerDataRootDic ??= {};
        const that = this as any;
        let fsName = `attr[${key}]Parse`;
        let attrValue = (item as any).attr[key];
        if (this.openMvc) {
            if (that[fsName]) {
                attrValue = that[fsName](key, item, parentItem);
            }
            else {
                if (/^:[^\=\s'"\\\/<>]+/.test(key)) {
                    attrValue = this["attr[:event]Parse"](key, item, parentItem);
                }
            }
        }

        console.log(attrValue)
        return attrValue;
    }

    "attr[:for]Parse"(key: string, item: IHtml, parentItem: IHtml) {



        const attrValue = item.attr[key];
        const forVModel = RegularFunctionCommon.firstResult(/(?<=in\s+)[^"]+/, attrValue);
        let [pCode, vCode] = RegularFunctionCommon.results(/(^.*(?=\.[^.]+)|(?<=\.)[^.]+$)/g, forVModel);
        pCode = (pCode || '').replace(/\s/g, '');



        item.controllerDomChildLevel = (item.controllerLevel as number) + 1;
        item.chid && item.chid.map(child => (child.controllerLevel = item.controllerDomChildLevel, child.controllerDomChildLevel = item.controllerDomChildLevel));

        let vModelString = parentItem.attr[':value'] || (`${pCode}.${vCode}`);
        if (pCode != 'data') {
            vModelString = `@el_${item.controllerLevel}.${vCode}`;
            //console.log(`-${pCode}-`)
            //console.log(attrValue, pCode, vCode, vModelString, item.controllerDataRootDic, item.controllerDataRootDic[pCode]);
            if (item.controllerDataRootDic[pCode]) {
                //console.log(item.controllerDataRootDic[pCode]);
                vModelString = `@${item.controllerDataRootDic[pCode]}.${vCode}`;
            }
        }

        const childSourceRoot = RegularFunctionCommon.firstResult(/[^@\)\s]+(?=[\)\s]+in)/, attrValue);
        const childTargetRoot = 'el_' + item.controllerDomChildLevel;
        const val = `($index_${item.controllerDomChildLevel}, @${childTargetRoot}) in ${vModelString}`;




        item.controllerDataRootDic[childSourceRoot] = childTargetRoot;
        item.chid && item.chid.map(childItem => childItem.controllerDataRootDic = { ...item.controllerDataRootDic });

        const controlId = 'ID' + item.controlRegisterLevel;
        // item.chid ??= [];
        // item.chid.push({
        //     nodeType: 'element',
        //     name: 'input',
        //     attr: {
        //         type: 'hidden',
        //         'ms-html': `excuteFn('${(parentItem as any).src}', '${controlId}', 'setValue', ${vModelString}, ${RegularFunctionCommon.firstResult(/^.*(?=\.)/, vModelString)}, '${RegularFunctionCommon.firstResult(/(?<=\.)[^\.]+$/, vModelString)}')`
        //     }
        // })
        if (this.openControlJs) {
            if (pCode == 'data' && vCode == 'value') {
                item.afterContent = `<input type="hidden" ms-html="excuteFn('${(parentItem as any).src}', '${controlId}', 'setValue', ${vModelString}, ${RegularFunctionCommon.firstResult(/^.*(?=\.)/, vModelString)}, '${RegularFunctionCommon.firstResult(/(?<=\.)[^\.]+$/, vModelString)}')" />`;
            }
        }


        return ['ms-for', val];
    }

    "attr[:event]Parse"(key: string, item: IHtml, parentItem: IHtml) {
        const attrValue = item.attr[key] as string;
        const val = this.controllerDataInfoBindParse(attrValue, item, parentItem);
        return [key.replace(':', 'ms-'), val];
    }

    "attr[:value]Parse"(key: string, item: IHtml, parentItem: IHtml) {
        const attrValue = item.attr[key] as string;
        const val = this.controllerDataInfoBindParse(attrValue, item, parentItem);
        if (/^(input|select|textarea)$/.test(item.name || '')) {
            const controlId = 'ID' + item.controlRegisterLevel;
            item.chid ??= [];

            if (this.openControlJs) {
                item.chid.push({
                    nodeType: 'element',
                    name: 'input',
                    attr: {
                        type: 'hidden',
                        'ms-html': `excuteFn('${(parentItem as any).src}', '${controlId}', 'setValue', ${val}, ${RegularFunctionCommon.firstResult(/^.*(?=\.)/, val)}, '${RegularFunctionCommon.firstResult(/(?<=\.)[^\.]+$/, val)}')`
                    }
                })
            }
            return ['ms-duplex', val];
        }
        return [];
    }

}
