/***********************************************************************************
* SYSTEM      : ALL
* BUSINESS    : RHtmlConverter
* FILE NAME   : rHtmlConverter.js
* PROGRAMMER  : 류정현
* DATE        : 24.03.20
* DESCRIPTION : HTML 이미지 변환 모듈 
*------------------------------------------------------------------
* MODIFY DATE   PROGRAMMER			DESCRIPTION
*------------------------------------------------------------------
*
*------------------------------------------------------------------
***********************************************************************************/
function rHtmlConverter(
    el,
    type = 'png'
){
    console.log(el, type)
    /*************************************************** */
    // 변수 및 생성자
    /*************************************************** */



    /*************************************************** */
    // Getter Setter
    /*************************************************** */



    /*************************************************** */
    // 초기화
    /*************************************************** */



    /*************************************************** */
    // 이벤트
    /*************************************************** */



    /*************************************************** */
    // 공통
    /*************************************************** */

    /**
     * element 의 Width 를 반환
     * @param {*} element (HTMLElement)
     * @returns (int) Width
     */
    function getWidth(element) {
        return +element.getBoundingClientRect().width
    }

    /**
     * element 의 Height 를 반환
     * @param {*} element (HTMLElement)
     * @returns (int) Height
     */
    function getHeight(element) {
        return +element.getBoundingClientRect().height
    }


    /**
     * Element 의 CSS List를 String으로 반환한다.
     * @param {*} element 
     * @returns 
     */
     function extCss(element) {
        let css = {}
        let style = window.getComputedStyle(element);
        for(let i=0; i<style.length; i++) {
            let property = style.item(i)
            // 만약 제외하고 싶은 Property 또는 값이 있을 경우 설정.
            // if(style.getPropertyValue(property)=="none") {
            //     continue;
            // }
            css[property] = style.getPropertyValue(property)
        }
        let cssString = ''
        for(let property in css) {
            cssString += property+':'+css[property]+';\n'
        }
        // css 반환 시 JSON 객체 형태로 반환 됨.
        return cssString;
    }



    /**
     * Element 하위의 모든 Element의 CSS List를 CSS String 으로 반환한다.
     * @param {*} element 탐색할 노드
     * @param {*} parent 탐색할 노드의 부모 ( 최초 실행 시 '' )
     * @param {*} nth 몇번째 자식인지 구분 ( 최초 실행 시 0 )
     * @returns 
     */
    function extCssRecursive(element, parent='', nth=0) {
        let cssString = extCss(element)    // CSS Json String 
        const tag = (parent==''? element.tagName : parent + ">" + element.tagName + ":nth-child(" + (+nth+1) + ")").toLowerCase()
        cssString = tag + "{" + cssString + "}\n"
        for(let i=0; i<element.children.length; i++) {
            let childCss = extCssRecursive(element.children[i], tag, i)
            cssString += (childCss + '\n')
        }
        return cssString;
    }

    /**
     * HTMLElement 기반의 SVG ForeignObject 생성
     * @param {*} element (HTMLElement)
     * @returns 
     */
    function genSvg(element) {
        const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${getWidth(element)}" height="${getHeight(element)}">
                        <foreignObject width="100%" height="100%">
                            <defs>
                                <style type="text/css">
                                    ${extCssRecursive(element)}
                                </style>
                            </defs>
                            <div xmlns="http://www.w3.org/1999/xhtml">
                                ${validationHtml(element)}
                            </div>
                        </foreignObject>
                    </svg>`
        return data
    }


    /******************************************************
     * 태그 유효성 검사
     */
    function checkTag(element) {
        let idx = 0
        while(true) {
            idx = ele.indexOf("<input", idx)<ele.indexOf("<img", idx)?ele.indexOf("<input", idx):ele.indexOf("<img", idx)
            if(idx==-1){
                break;
            }
            let notCloseIdx = ele.indexOf(">", idx)
            idx = notCloseIdx
            if(ele[notCloseIdx-1]=="/"){
                continue;
            }
            ele = ele.slice(0,notCloseIdx) + "/" + ele.slice(notCloseIdx, ele.length+1)
        }
    }

    function validationHtml(elements='') {
        const SELF_CLOSE_TAG = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']

        let tagStack = []
        let ele = elements.outerHTML
        let idx = 0 
        while(true) {
            let openIdx = ele.indexOf("<",idx)  //0
            let closeIdx1 = ele.indexOf("</",idx)   //216
            let closeIdx2 = ele.indexOf("/>",idx)   //-1
            let closeIdx = 0
            let closeTag = ''
            if((openIdx==-1 && closeIdx1==-1 && closeIdx2==-1) || idx==ele.length) {
                break;
            }

            // 닫는 태그 확인
            if(closeIdx1!=-1 && closeIdx2==-1) {
                closeIdx = closeIdx1
                closeTag = ele.substring(closeIdx1+2,ele.indexOf(">",closeIdx1))
            } else if(closeIdx==-1 && closeIdx2!=-1) {
                closeIdx = closeIdx2
                closeTag = '/>'
            } else if(closeIdx1!=-1 && closeIdx2!=-1 && closeIdx1<closeIdx2) {
                closeIdx = closeIdx1
                closeTag = ele.substring(closeIdx1+2,ele.indexOf(">",closeIdx2))
            } else if(closeIdx1!=-1 && closeIdx2!=-1 && closeIdx1>closeIdx2) {
                closeIdx = closeIdx2
                closeTag = '/>'
            }

            if(closeIdx<=openIdx) {
                let openTag = tagStack.pop()
                idx = closeIdx+1
                if(closeTag!='/>' && openTag.tagName!=closeTag) {
                    if(SELF_CLOSE_TAG.includes(openTag.tagName)){
                        ele = ele.substring(0, ele.indexOf('>',openTag.tagPosition))+'/'+ele.substring(ele.indexOf('>',openTag.tagPosition), ele.length)
                        idx++;
                    } else {
                        ele = ele.substring(0, closeIdx)+'</'+openTag.tagName+'>'+ele.substring(closeIdx, ele.length)
                        idx = idx + 3 + openTag.tagName.length
                    }
                }
            } else {
                let openTagEnd = ele.indexOf(' ',openIdx+1)<ele.indexOf('>',openIdx+1)?ele.indexOf(' ',openIdx+1):ele.indexOf('>',openIdx+1)
                tagStack.push({tagPosition:openIdx, tagName:ele.substring(openIdx+1, openTagEnd)})
                idx = openIdx+1
            }
        }
        return ele
    }

    /**
     * HTMLElement 를 이미지로 변환한다. ( 일단 다운로드 > 변경예정 )
     * @param {*} element (HTMLElement)
     */
    function htmlToImg(element) {
        // ELEMENT TO SVG
        const data = genSvg(element)
        const img = new Image()
        img.onload = function () {
            const tmpCanvas = document.createElement('canvas')
            tmpCanvas.width = getWidth(element)
            tmpCanvas.height = getHeight(element)
            const tmpCtx = tmpCanvas.getContext('2d')
            tmpCtx.globalcompositeOperation = 'source-atop'
            tmpCtx.drawImage(img, 0, 0)
            const imgUrl = tmpCanvas.toDataURL()
            const link = document.createElement('a')
            link.href = imgUrl
            link.download = 'full_board'
            link.click()
        }

        img.onerror = function(e) {
            console.log('************ IMG LOAD ERROR : ', e)
        }

        
        // 테스트 코드 
        // const dataUrl = window.URL || window.webkitURL || window
        // const svg = new Blob([data],{type:'image/svg+xml; charset=utf-8'})
        // const url = dataUrl.createObjectURL(svg)
        // console.log(url)
        //////////////
        img.src = 'data:image/svg+xml;charset=utf-8,' + data
        const linkTest = document.createElement('a')
        linkTest.href= 'data:image/svg+xml;charset=utf-8,' + data
        linkTest.download = 'test'
        linkTest.click()
    }

    // 테스트코드
    htmlToImg(data)
    ///////////////
}

export { rHtmlConverter }