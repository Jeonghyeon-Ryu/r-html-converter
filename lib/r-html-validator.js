function rHtmlValidator(el) {
  console.log("HTML VALIDATOR");

  // function isTagClosed(tag) {
  //   // 태그 이름 추출
  //   const match = tag.match(/<(\w+)(?:\s+.*?)?>/);
  //   if (!match) {
  //     return false;
  //   }

  //   const tagName = match[1];

  //   // 닫는 태그 확인
  //   return !!tag.match(new RegExp(`</${tagName}>`));
  // }

  function isTagCLosed2(tag) {
    // 태그 시작부분확인
    // 시작 태그이면 배열에 넣기
    let tagString = tag.outerHTML;

    // 배열에 넣고 다음 </ 붙은 태그 만나기 전까지 다 넣기
    // </ 붙은 태그 만날시 스택 제일 위의 태그명과 비교
    // 제대로 닫혀 있을시 배열.pop()
    //안닫혀있으면 고쳐주고 pop()
  }

  // return isTagClosed(el);
}

class Stack {
  constructor() {
    // item들을 받을 배열 생성
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.pop();
  }

  peek() {
    if (this.items.length === 0) {
      return null;
    }
    // items 배열의 마지막 item만 가져와준다. pop()과 다르게 배열에서 아이템이 빠지는 것이 아닌 유지된 채로 마지막 값만 받아와줌
    return this.items[this.items.length - 1];
  }

  getSize() {
    return this.items.length;
  }

  isEmpty() {
    return this.getSize() === 0;
  }
}
export { rHtmlValidator, Stack };
