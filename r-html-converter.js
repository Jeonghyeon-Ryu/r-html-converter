import { rHtmlValidator } from './lib/r-html-validator.js'

function rHtmlConverter(
    el,
) {
    console.log('HTML CONVERTER')



    /********************************************************
     * 공통 함수
     ********************************************************/

    function getElementWidth(element) {
        return element.getBoundingClientRect().width;
    }

    function getElementHeight(element) {
        return element.getBoundingClientRect().height;
    }


    /**
     * 특정 HTML 의 CSS 를 CSS String 으로 반환
     * @param {*} element 조회 할 Element (Node)
     * @returns 
     */
    function extCss(element) {
        let css = {}
        let style = window.getComputedStyle(element);
        for(let i=0; i<style.length; i++) {
            let property = style.item(i)
            // if(style.getPropertyValue(property)=="none") {
            //     continue;
            // }
            css[property] = style.getPropertyValue(property)
        }
        let cssString = ''
        for(let property in css) {
            cssString += property+':'+css[property]+';\n'
        }
        return cssString;
    }

    /**
     * HTML 하위 Child 까지 재귀호출하며 CSS String 반환
     * @param {*} element 조회 할 Element(Node)
     * @param {*} parent 부모 Tag, 최상위 일 경우 ''
     * @param {*} nth 몇번 째 자식인지 판별
     * @returns 
     */
    function extCssRecursive(element, parent='', nth=0) {
        let cssString = extractCss(element)    // CSS Json String 
        const tag = (parent==''? element.tagName : parent + ">" + element.tagName + ":nth-child(" + (+nth+1) + ")").toLowerCase()
        cssString = tag + "{" + cssString + "}\n"
        for(let i=0; i<element.children.length; i++) {
            let childCss = extractCssRecursive(element.children[i], tag, i)
            cssString += (childCss + '\n')
        }
        return cssString;
    }


    /**
     * HTML Element 를 SVG 파일로 변환
     * @param {*} element (HTMLElement)
     */
    function genSvg(element) {
        const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${getElementWidth(element)}" height="${getElementHeight(element)}">
                        <foreignObject width="100%" height="100%">
                        <defs>
                            <style type="text/css">
                                ${extCssRecursive(element)}
                            </style>
                        </defs>
                            <div xmlns="http://www.w3.org/1999/xhtml">
                                ${element.outerHTML}
                            </div>
                        </foreignObject>
                    </svg>`
    }

    /**
     * SVG 를 Image 로 변환한다.
     * @param {*} svg (String)
     */
    function convertSvgToImg(svg) {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = function() {
                resolve(img)
            }
            img.src = 'data:xml+svg;charset=utf-8,' + svg
        })
    }


}


export { rHtmlConverter }