interface IKeyValue {
    key: string
    value: string | object
}

interface IKeyVal {
    [key: string]: string | object | number | boolean
}

interface IDBTableNameAndRowModel {
    organization?: object,
    organization_config?: object,
    user?: object,
    user_account?: object,
    article_type?: object,
    article_type_content?: object,
    article?: object,
    article_content?: object,
    product?: object,
    product_content?: object,
    access_record?: object,
    access_record_api?: object,
    access_record_statics?: object,
    r_sys_router?: object,
    r_custom_router?: object,
    router?: object,
    template?: object
    comment_record?: object
    access_statistics?: object
}

interface IWebViewCompose {
    html: string
    ts: string
    js?: string
    css: string
    txt?: string
    json?: string
}

type THtmlNodeType = 'element' | 'elementEnd' | 'note' | 'declare' | 'text'

interface IHtml {
    /** 
     * 标签全称
     * @举例 div、span、asp:Repeart、input等
    */
    name?: string
    /**
     * 标签前缀
     * @举例 asp:Repeart => asp
     */
    tagPrefix?: string
    /**
     * 标签名称
     * @举例 div、span、asp:Repeart => Repeart、input等
     */
    tagName?: string
    /** 
     * 节点类型 元素、元素结尾、注释、声明、文本
     */
    nodeType?: THtmlNodeType
    /** 
     * 节点文本内容
     */
    text?: string
    afterContent?: string;
    /** 
     * 子节点信息
     */
    chid?: IHtml[],
    /** 
     * 节点属性信息
     */
    attr?: any

    /** 控件自身层级 */
    controlLevel?: number
    /** dom 层级 */
    controlDomLevel?: number
    // 控件引用层级
    controlRegisterLevel?: number
    /** 控制器层级 */
    controllerLevel?: number
    /** 控件子项dom（控制器）层级 */
    controllerDomChildLevel?: number
    controllerDataRootDic?: any
    /** 节点所在文件路径 */
    src?: string
}
interface IHtmlRegisterTag extends IHtml { }

interface IHtmlControlNodeOfDataInfo {
    /** 控件引用路径  */
    controlRegisterPath: string
    /** 控件节点层级 */
    controlNodeLeve: number
    /** 控件引用层级 */
    controlRegisterNodeLeve: number
    /** 控件ID 控件数据如果在数组下，控件ID需要加上索引。 */
    controlId: string

    controllerDataNodeParentsPathDic?: any
    /** 当前控制器数据节点父级路径 */
    controllerDataNodeParentPath: string
    /** 控制器数据节点层级 */
    controllerDataNodeLeve: number
    /** 控制器数据节点路径 */
    controllerDataNodePath: string
    /** 控制器数据节点层级 */
    controllerDataNodeChildLeve: number
    /** 控制器类型 */
    controllerDataNodeType: 'Array' | 'Number' | 'String' | 'Object' | ''
    /** 控制器控件ID与路径对照，仅当前组件使用，不能跨组件使用。 */
    controllerControlIdAndPathDic?: any
}