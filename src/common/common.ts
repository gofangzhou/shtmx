export default class Common {

    /**
     * 判断数据类型
     * @param element 被检查的值
     * @param TypeName 匹配类型名称 Number,Boolean,String,Array,Function,Object,Undefined,Null
     * @returns 
     */
    static isType(element: any, TypeName: 'Number' | 'Boolean' | 'String' | 'Array' | 'Function' | 'Object' | 'Undefined' | 'Null') {
        return Object.prototype.toString.call(element) == `[object ${TypeName}]`;
    }

    /**
     * 判断一个值是否为空（null、undefined、NaN、Invalid Date）
     * @param val 值
     * @returns 
     */
    static isNull(val: any) {
        return /^(null|undefined|nan|\s*Invalid\s*date\s*)$/gi.test(val);
    }

    static stringFormat(str: any, ...args: Object[]) {
        return str.replace(/{(\d+)}/g, function () {
            return args[arguments[1]];
        });
    }
}