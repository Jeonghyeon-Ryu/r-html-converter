import { Stack } from "./stack.js";
import { TagInfo } from "./TagInfo.js";

function rHtmlValidator(el=HTMLElement) {
  let htmlString = el.outerHTML;

  /** <script> 까지 가져와지는 경우 script 절 제외  */
  if (htmlString.indexOf("<script") != -1) {
    htmlString = htmlString.slice(0, htmlString.indexOf("<script"));
  }
  /** 주석 존재할 경우 제거 */
  if (htmlString.indexOf("<!--") != -1) {
    htmlString = htmlString.replace(/<!--.*?-->/gs, "");
  }
  
  // let htmlString =
  //   '<div class="container">\n      <div class="header">\n        <button id="header-btn1">버튼1</button>\n        <button id="header-btn2">버튼2</button>\n        <button id="header-btn3">버튼3</button>\n      \n      <div class="article">\n        테스트\n        <input type="text">\n        <input type="text">\n        <lable>라벨 : <input type="text"></lable>\n        <hr>\n        <hr>\n      </div>\n      <div class="footer">\n        FOOTER\n      </div>\n    </div>\n  \n';
  console.log("htmlString = > " + htmlString);
  let tagNameRegex  = /^<\/*(\w+)\s*(?:.*?)?>$/; // tag name 추출 정규표현식
  let tagRegex      = /<(?:\/?\w+(?:\s+\w+(?:=(?:".*?"|'.*?'|[^'">\s]+))?)*\s*|\/)>/g; // tag 추출 정규 표현식
  let openTagStack  = new Stack();

  let tagList     = Object.entries(htmlString.match(tagRegex)); // 전체 태그 추출
  let openTagList = tagList.filter(
    (tag) =>
      tag[1].indexOf("</") != 0 &&
      !EMPTY_TAG.includes(tag[1].match(tagNameRegex)[1])
  ); // 여는 태그 ( 자가종료태그 제외한 )
  let closeTagList = tagList.filter((tag) => tag[1].indexOf("</") == 0); // 닫는 태그

  let openTagCount = openTagList.length;
  let closeTagCount = closeTagList.length;
  let beforeCloseTag; // 가장최근에 매칭되어서 사라진 닫는태그 저장
  let currentTag; // 현재 태그를 저장

  /**
   * 특수문자 또는 공백인지 확인
   * @param {String} str
   * @returns boolean
   */
  function isWord(str) {
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>\s]/;
    return !specialCharRegex.test(str);
  }

  /**
   * 유효성 검사 후 매칭되지 않는 태그 찾아서 고쳐주어 문자열로 반환
   * @param {String} html
   * @returns String
   */
  function validateAndCorrectTag(html) {
    console.log(html);
    for (let i = 0; i < html.split("").length; i++) {

      if (html.split("")[i] == "<" && isWord(html.split("")[i + 1])) {
        let tag     = html.slice(i, html.indexOf(">", i) + 1);
        let tagName = tag.match(tagNameRegex)[1];

        currentTag  = new TagInfo(i, tag, tagName);

        /** 자가종료태그의 경우 / 가 있는지 확인 후 없으면 달아줍니다 */
        if (EMPTY_TAG.includes(currentTag.tagName)) {
          console.log("tagName =>" + currentTag.tagName)
          html = currentTag.tag.charAt(currentTag.tag.length-2) != "/" ? html.slice(0, html.indexOf(">", currentTag.index)) + "/" + html.slice(html.indexOf(">", currentTag.index)) : html;
          continue;
        }

        console.log("tagName =>" + tag);

        /** 여는 태그일 경우 */
        if (currentTag.tag.indexOf("</") != 0) {
          openTagStack.push(new TagInfo(i, tag, tagName));

          beforeCloseTag = null;

          /** 닫는 태그일 경우 */
        } else {

          if (openTagStack.isEmpty() && html.indexOf(tagRegex, i) == -1) {// stack 안에 여는 태그가 없고 , 다음에 태그가 존재 하지 않을 경우 반복문 종료
            
            return false;
          }

          /** stack 제일 위의 이름과 이름이 매칭된다면 */
          if (openTagStack.peek().tagName == currentTag.tagName) {

            openTagStack.pop();
            beforeCloseTag = Object.assign({}, currentTag);
            openTagCount--;
            closeTagCount--;

            /** 매칭되지 않는다면 */
          } else {
            let sliceStartingPoint = beforeCloseTag == null ? openTagStack.peek().index + openTagStack.peek().tag.length : beforeCloseTag.index + beforeCloseTag.tag.length; // <div> <p></p> <p></p> </p> 상황방지
            let isLineBreakPoint   = html.slice(sliceStartingPoint, currentTag.index).indexOf("\n") != -1 ? true : false; // 줄바꿈\n 있는지 여부

            /** 여는 태그의 수가 닫는 태그의 수보다 많을 경우 -> 닫는 태그 추가하여 삽입 */
            if (openTagCount >= closeTagCount) {
              let insertCloseTag = "</" + openTagStack.peek().tagName + ">"; // 삽입할 닫는태그

              /** 사이에 줄바꿈이 존재한다면 */
              if (isLineBreakPoint) {
                let lineBreakPoint = html.indexOf("\n", sliceStartingPoint);
                html =
                  html.slice(0, lineBreakPoint) +
                  insertCloseTag +
                  html.slice(lineBreakPoint);

                beforeCloseTag = new TagInfo(
                  lineBreakPoint,
                  insertCloseTag,
                  openTagStack.peek().tagName
                );
                openTagStack.pop();
                openTagCount--;

                i += insertCloseTag.length + currentTag.tag.length;

                /** 줄바꿈이 존재하지 않는다면  */
              } else {
                html =
                  html.slice(0, sliceStartingPoint) +
                  insertCloseTag +
                  html.slice(sliceStartingPoint);

                beforeCloseTag = new TagInfo(
                  sliceStartingPoint,
                  insertCloseTag,
                  openTagStack.peek().tagName
                );
                openTagStack.pop();
                openTagCount--;

                i += insertCloseTag.length + currentTag.tag.length;
              }

              currentTag = null; // 여는 태그만 남을경우를(반복문이 다 돌고나서 currentTag 가 없고 openTagStack 에만 남아있는것을) 확인하기위해 넣음

              /** 닫는 태그의 수가 여는 태그의 수보다 많을 경우 -> 여는 태그 추가하여 삽입 */
            } else {
              let insertOpenTag = "<" + currentTag.tagName + ">";

              /** 사이에 줄바꿈이 존재한다면 */
              if (isLineBreakPoint) {
                let lineBreakPoint = html.indexOf("\n", sliceStartingPoint);
                html =
                  html.slice(0, lineBreakPoint) +
                  insertOpenTag +
                  html.slice(lineBreakPoint);

                beforeCloseTag = Object.assign({}, currentTag);
                openTagStack.pop();
                closeTagCount--;

                i += insertOpenTag.length + currentTag.tag.length;

                /** 줄바꿈이 존재하지 않는다면  */
              } else {
                html =
                  html.slice(0, sliceStartingPoint) +
                  insertOpenTag +
                  html.slice(sliceStartingPoint);

                beforeCloseTag = Object.assign({}, currentTag);
                openTagStack.pop();
                closeTagCount--;

                i += insertOpenTag.length + currentTag.tag.length;
              }
            }
          } // 매칭 안될시 끝
          currentTag = null;
        }
      } // 태그 만날시 매칭 기능 끝
    } // html 문자 배열 반복문 끝

    // 모든 반복문 돌고 나서 남은 태그 존재가능

    console.log(openTagStack);
    console.log("currentTag => " + currentTag);

    if (openTagStack.isEmpty() && currentTag != null) {
      // 닫는 태그가 남았을 경우 -> 여는 태그 추가

      let isertOpenTag = "<" + currentTag.tagName + ">";

      if (currentTag.tagName == "div") {
        // div 일 경우에 넓게 묶는다

        html = isertOpenTag + html;
      } else {
        // div 아닌 태그는 옆에 붙힌다.

        html =
          html.slice(0, beforeCloseTag.nextIndex) +
          isertOpenTag +
          html.slice(beforeCloseTag.nextIndex);
      }
    }

    if (!openTagStack.isEmpty() && currentTag == null) {
      // 여는 태그가 남았을 경우 -> 닫는 태그 추가

      let insertCloseTag = "</" + openTagStack.peek().tagName + ">";

      if (openTagStack.peek().tagName == "div") {
        html = html + insertCloseTag;
      } else {
        html =
          html.slice(0, html.search(tagRegex, openTagStack.peek().nextIndex)) +
          insertCloseTag +
          html.slice(html.search(tagRegex, openTagStack.peek().nextIndex));
      }
    }

    console.log(html);
    return html;
  }

  return validateAndCorrectTag(htmlString);
}

// 자가종료태그 (닫는 태그가 필요하지 않는 태그들)
const EMPTY_TAG = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
  "img"
];
// rHtmlValidator();

export { rHtmlValidator };
