class TagInfo{

    constructor(index=0, tag='', tagName='') {
        this.index = index;
        this.tag = tag;
        this.tagName = tagName;
        this.nextIndex = index + tag.length;
    }

}

export { TagInfo };