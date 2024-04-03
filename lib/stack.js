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

export { Stack };
