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
import { rHtmlValidator } from "./lib/r-html-validator.js"

const rHtmlConverter = (function(){
    /*************************************************** */
    // 변수 및 생성자
    /*************************************************** */
    let htmlValidator = null

    /*************************************************** */
    // Getter Setter
    /*************************************************** */



    /*************************************************** */
    // 초기화
    /*************************************************** */
    async function init(element, type, options) {
        const isTest = options?.isTest??false  // 테스트 유무 (테스트 시 테스트코드로 진행)
        if (isTest) {
            htmlValidator = async (element) =>  await rHtmlValidator(element);
        } else {
            htmlValidator = (element) => htmlValidation(element)
        }
    }


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
            cssString += property+':'+css[property]+'; '
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
        let tag = ''
        if(element.getAttribute('id')) {
            tag = '&#35;' + element.getAttribute('id')
        } else if(element.getAttribute('class')) {
            tag = '.' + element.classList[0]
        } else {
            tag = element.tagName + ":nth-child(" + (+nth+1) + ")"
        }
        tag = (parent==''? tag : parent + ">" + tag).toLowerCase()
        cssString = tag + "{" + cssString + "\n}"
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
    async function genSvg(element) {
        const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${getWidth(element)}" height="${getHeight(element)}">
                        <style type="text/css">
                            ${extCssRecursive(element)}
                        </style>
                        <foreignObject width="100%" height="100%">
                            <div xmlns="http://www.w3.org/1999/xhtml">
                                ${await htmlValidator(element)}
                            </div>
                        </foreignObject>
                    </svg>`
        return btoa(unescape(encodeURIComponent(data)))
    }


    /******************************************************
     * 태그 유효성 검사 ( 테스트 코드 )
     ******************************************************/
    function htmlValidation(elements='') {
        const SELF_CLOSE_TAG = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']

        let tagStack = []
        let ele = elements.outerHTML
        let idx = 0 
        while(true) {
            // 열기 태그 인식
            let openIdx = ele.indexOf("<",idx)
            if(ele.substring(openIdx,openIdx+4) === '<!--') {
                // 주석 패스
                idx = ele.indexOf('-->', openIdx) + 4
                continue;
            }
            // 닫기 태그 인식 ( 2가지 종류 )
            let closeIdx1 = ele.indexOf("</",idx)
            let closeIdx2 = ele.indexOf("/>",idx)
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

            // 가장 최근의 태그를 인식
            // 열기 일 경우 > Push
            // 닫기 일 경우 > Pop > Pop 열기태그와 닫기태그 비교 > 같을경우 > closeTag 뒤로 idx 증가
            //                                                > 다를경우 > '>'태그 찾아서 닫기 넣기 > pop > closeTag와 비교 > 같을때 까지 반복
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
    async function htmlToImg(element) {
        // ELEMENT TO SVG
        const data = await genSvg(element)
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
        // img.src = 'data:image/svg+xml;charset=utf-8,' + data
        img.src = 'data:image/svg+xml;base64,' + data
        const linkTest = document.createElement('a')
        // linkTest.href= 'data:image/svg+xml;charset=utf-8,' + data
        linkTest.href= 'data:image/svg+xml;base64,' + data
        linkTest.download = 'test'
        linkTest.click()
    }

    
    return {
        /**
         * Convert HTML to image
         * @param {*} element HTML Element
         * @param {*} type png | jpg | jpeg 
         * @param {*} options 
         */
        toImg : async function(element, type, options) {
            await init(element, type, options)
            await htmlToImg(element)
        },
        /**
         * Convert HTML to pdf
         * @param {*} element 
         * @param {*} options 
         */
        toPdf : function(element, options) {

        }
    }
})();

export { rHtmlConverter }