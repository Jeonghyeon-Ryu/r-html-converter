import { Stack } from "./stack.js";

function rHtmlValidator(el = HTMLElement) {
  let tag = el.outerHTML;

  // let tagStack = new Stack();
  // // const tagRegexCorrectForm = /<([/?a-z0-9]+)(?:\s+([^\s>]+="[^"]+"))*(?:\s+|$)*>/g;
  // const tagRegex = /(<.+?>)(?=\s|\w|<|$)/g;

  // let tagMatch = tag.match(tagRegex);

  // // 일반 태그 검사
  // let tagArr = tagMatch.filter((tag) => {
  //   !EMPTY_TAG.includes(extTagNm(tag));
  // });

  // if (isEvenLength(tagArr)) {
  //   // 여닫는 태그 이름이 매칭되는지 확인
  // } else {
  //   // 홀수일시 매칭이 안된 태그 찾아서 태그 삽입하기
  // }

  // // 매칭안된 태그 이름 확인
  // function detectUnmatchedTag(tagArr = [""]) {
  //   let stack = new Stack();
  //   let closeTagArr = tagArr.filter((tag) => {
  //     tag.charAt(1) == "/";
  //   });

  //   tagArr.forEach((tag, idx) => {
  //     // 닫는 태그가 아니면 스택에 쌓기
  //     if (tag.charAt(1) != "/") {
  //       stack.push(tag);
  //     } else {
  //       //닫는 태그일시 비교
  //       // 태그 이름 같을시 pop()
  //       let peekTagNm = stack.peek();
  //       if (extTagNm(peekTagNm) == extTagNm(tag)) {
  //         stack.pop();
  //         closeTagArr.splice(idx, 1);
  //       } else {
  //         // 태그 이름 틀릴시 (여는게틀렸는지 닫는게틀렸는지 확인)
  //         // stack 에 남아있는게 많으면 여는곳에서 오류 닫는태그생성
  //         // closeTagArr 에 남아있는게 많으면 닫는곳에서 오류 여는태그생성
  //         // 태그를 어디에 삽입해야하는가
  //       }
  //     }
  //   });
  // }

  /**
   * <tag> 에서 tagName 추출
   * @param {String} str
   * @returns String
   */
  function extTagNm(str = "") {
    const firstSpaceIndex = str.indexOf(" ");
    if (firstSpaceIndex == -1) {
      return str.indexOf("/") == -1
        ? str.slice(1, str.length - 1)
        : str.slice(str.indexOf("/") + 1, str.length - 1);
    } else {
      return str.indexOf("/") == -1
        ? str.slice(1, firstSpaceIndex)
        : str.slice(str.indexOf("/") + 1, firstSpaceIndex);
    }
  }

  /**
   * 배열의 길이가 짝수 인지 (여닫는 태그수가 매칭되는지) 확인
   * @param {Array} arr
   * @returns boolean
   */
  function isEvenLength(arr = []) {
    if (arr.length == 0) {
      return false;
    }
    return arr.length % 2 == 0 ? true : false;
  }

  /**
   * HTML 문자열을 탐색하여 자가종료태그 확인후 끝에 / 가 없으면 추가해 주는기능
   * @returns String
   */
  function closeEmptyTag() {
    let regx = /^<\/*(\w+)\s*(?:.*?)?>$/;
    let localTag = tag;
    console.log(localTag.split(""));
    for (let i = 0; i < localTag.split("").length; i++) {
      if (localTag.split("")[i] == "<" && localTag.split("")[i + 1] != " ") {
        let tagName = localTag.slice(i, localTag.indexOf(">", i) + 1);
        tagName = tagName.match(regx)[1];

        if (EMPTY_TAG.includes(tagName)) {
          console.log(tagName);
          // 자가 종료 태그 끝에 / 가 없을시에 닫아주기
          let returnTag = localTag.slice(i, localTag.indexOf(">", i) + 1);

          if (returnTag.indexOf("/") == -1) {
            localTag =
              localTag.slice(0, localTag.indexOf(">", i)) +
              "/" +
              localTag.slice(localTag.indexOf(">", i));
          }
        }
      }
    }
    console.log(localTag);
    return localTag;
  }

  return closeEmptyTag();
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
];
// rHtmlValidator();

export { rHtmlValidator };
