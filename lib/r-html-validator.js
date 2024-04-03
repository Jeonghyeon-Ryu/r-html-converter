import { Stack } from "./stack.js";

function rHtmlValidator(el) {
  let tag = el;
  let tagStack = new Stack();

  // const tagRegexCorrectForm = /<([/?a-z0-9]+)(?:\s+([^\s>]+="[^"]+"))*(?:\s+|$)*>/g;
  const tagRegex = /(<.+?>)(?=\s|\w|<|$)/g;
  let tagMatch2 = tag.match(tagRegex);
  console.log(tagMatch2);
  // 태그 배열 반복문
  tagMatch2.forEach((tag) => {
    // 닫는 태그가 아니면 스택에 쌓기
    if (tag.charAt(1) != "/") {
      // 자가종료태그 일시 건너뛰기
      if (EMPTY_TAG.includes(extTagNm(tag))) return;

      tagStack.push(tag);
    } else {
      // 닫는 태그 일시 스택 가장 위 태그의 태그네임과 비교하여 같으면 pop()
      let peekTagNm = tagStack.peek();
      if (extTagNm(peekTagNm) == extTagNm(tag)) {
        tagStack.pop();
      }
    }
  });

  // stack 사이즈가 0이면 true 아니면 false
  if (tagStack.getSize() == 0) {
    console.log(true);
  } else {
    console.log(false);
  }

  // 태그네임 추출
  function extTagNm(str) {
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
export { rHtmlValidator };
