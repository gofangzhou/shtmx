export default class RegularExampleHtml {
    /** 获取标签名称 => 匹配一次 */
    static get tagName() { return /[^\\\/<>\s]+/i; }

    /**
     * 获取注释  &lt;!--...--> =》 匹配一次
     */
    static get note() { return /^<\!--.*?-->/is; }

    /**
     * 获取注册标签 &lt;!--.*Register.*-->
     */
    static get noteRegisterTag() {
        return /<!--.*Register.*-->/gi;
    }

    /**
     * 获取注册标签实体属性值集合
     * @eg1 &lt;!--@Register 导入“dir/path”，“uc1”为前缀，“control1”为后缀。-->
     * @eg2 &lt;!--@Register 根据模板“dir/path”，自定义&lt;uc1:control1>标签。 -->
     * @eg3 &lt;!--@Register &lt;dir/path> to &lt;uc1:control1> -->
    */
    static get noteRegisterTagSemantemeInfo() { return /((?<=[“"<:]+))[a-zA-Z0-9-_\u4e00-\u9fa5\\\/]+/g; }

    /** 获取元素 */
    static get element() { return /^<[^%\!\\\/\s<>]+[^<>]*>*/i; }

    /** 获取元素结束 */
    static get elementEnd() { return /^<[\\\/]+[^<>]*>*/i; }

    /** 获取元素属性集合 */
    static get elementAttrs() { return /(?<=\s)[a-zA-Z0-9\u4e00-\u9fa5\:\-\_]+(\[\d+\])*[\+]*(=(["']).*?(?<=[^\\])\3)*/gi; }

    /** 获取属性[key,value] => 匹配一对属性 */
    static get elementAttrKeyValue() { return /(^[^<>\\\/\=]+|(?<=(['"])).*?(?=(?<=[^\\])\2))/gi }

    /** 获取文档声明 */
    static get doctype() { return /<!doctype[^<>]*>*/i; }

    /** 
     * 获取文本内容
     */
    static get text() { return /^({%.*?%}|[^<>]|<%.*?%>)*/; }

}