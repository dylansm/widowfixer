class WidowFixer {
  constructor() {
    this.elements = [...document.querySelectorAll('.wf')];
    this.txtNodes = {};
    this.inspectElements();
  }

  inspectElements() {
    this.elements.forEach((wfEl, i) => {
      this.txtNodes[i] = [];
      this.downwardTraverseChildren(wfEl, i);
    });
    // TODO remove
    this.checkForWidows(this.txtNodes[2][1]);
  }

  downwardTraverseChildren(el, i) {
    el.childNodes.forEach((child) => {
      if (child.nodeType === 1) {
        this.downwardTraverseChildren(child, i);
      } else {
        this.txtNodes[i].push(child)
      }
    });
  }

  checkForWidows(textNode) {
    // console.log(textNode);
    console.log(textNode.nodeValue.lastIndexOf(' '));
    let range = document.createRange();
    const lastIndex = textNode.nodeValue.length;
    let i = lastIndex;
    while(i--) {
      range.selectNodeContents(textNode);
      range.setStart(textNode, i);
      range.setEnd(textNode, lastIndex);
      console.log(i, lastIndex);
      const rect = range.getBoundingClientRect();
      console.log(rect);
    }
  }

  extendRange(el, textNode) {
    const textRange = document.createRange();
    textRange.selectNodeContents(textNode);
    textRange.setStart(textNode, 0);

    // const lastWordWithSpace = textNode.textContent.split(/(\s)/).filter(Boolean);
    // console.log(lastWordWithSpace);

    textRange.setEnd(textNode, 1);
    // console.log(range.toString());
    const rect = textRange.getBoundingClientRect();
    const spaceMatches = textNode.textContent.match(/\s.+/g);
    // console.log(spaceMatches);

    // this.ranges[el].push(textNode);

    console.log(this.textNodes);

    // textNode.nodeValue = textNode.textContent.replace(/\s/g, '\u00A0 ');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const wf = new WidowFixer();
});
