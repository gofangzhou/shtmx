export default class RegularFunctionCommon {
    /**
     * 获取正则查找的第一个结果
     * @param reg 正则表达式
     * @param inputVal 被解析的内容
     * @returns 查找结果，未找到时默认为空字符串。
     */
    static firstResult(reg: RegExp, inputVal: string) { return (inputVal.match(reg) || [''])[0]; }
    /**
     * 获取正则查找的多个结果
     * @param reg 正则表达式
     * @param inputVal 被解析的内容
     * @returns 查找结果，未找到时默认为空字符串。
     */
    static results(reg: RegExp, inputVal: string) { return inputVal.match(reg) || [] }
}