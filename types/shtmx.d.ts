
/**
 * HTML 转 语法树
 * @param htmlContent 指定HTML内容或NEW时的内容
 * @returns 语法树
 */
export function htmlToAstJson(htmlContent: string): []

/**
 * 解析模板
 * @param settings 配置
 * @returns 
 */
export function templateAnalysis(settings: ISHtmxSetting): void

interface ISHtmxSetting {
    /** 模板路径 */
    templatePath: string
    /**
     * 获取模板内容
     * @param templatePath 模板路径
     * @param templateType 模板类型 html css js
     * @param callback viewContent 模板内容
     * @returns 
     */
    template: (templatePath: string, templateType: 'html') => string
    /**
     * 返回模板最终解析结果
     * @param viewContent 最终内容
     * @param templateNames 所有模板
     * @returns 
     */
    result: (viewContent: string, templateNames: string[]) => void
    ///** 模型视图控制器功能（实验性） */
    //mvc?: ISHtmxMvcTagAttr
}

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