import RegularExampleHtml from "../common-example/regular-example-html";
import RegularFunctionCommon from "./regular-function-common";

export default class RegularFunctionHtml {

    /**
     * HTML标签内容转对象
     * @param htmlContent <div id="panlmain" class="..."  ... >
     * @returns // {id:'panlmain',class="..."}
     */
    static tagAttrToObject(htmlContent: string): IKeyVal | null {
        const attrs = RegularFunctionCommon.results(RegularExampleHtml.elementAttrs, htmlContent);
        if (!attrs || attrs.length == 0) return null;
        let model: IKeyVal = {};
        attrs.map(strAttr => {
            let [key, value] = RegularFunctionCommon.results(RegularExampleHtml.elementAttrKeyValue, strAttr.replace(/^\s+/, ''));
            key && (model[key] = value);
        })
        return model;
    }

    static valueBindStringSplit(bindText: string): { rootCode: string, valueCode: string } {
        let [rootCode, valueCode] = RegularFunctionCommon.results(/(^.*(?=\.[^.]+)|(?<=\.)[^.]+$)/g, bindText);
        rootCode ||= '';
        return { rootCode, valueCode };
    }
}