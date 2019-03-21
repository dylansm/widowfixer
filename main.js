class WidowFixer {
  constructor() {
    this.wordThreshold = 1;
    this.elements = [...document.querySelectorAll('.wf')];
    this.txtNodes = {};
    this.inspectElements();
  }

  inspectElements() {
    this.elements.forEach((wfEl, i) => {
      this.txtNodes[i] = { nodes: [] };
      this.downwardTraverseChildren(wfEl, i);
      this.checkForWidows(i, this.txtNodes[i].nodes.length - 1);
    });
  }

  downwardTraverseChildren(el, i) {
    el.childNodes.forEach((child) => {
      if (child.nodeType === 1) {
        this.downwardTraverseChildren(child, i);
      } else {
        this.txtNodes[i].nodes.push(child);
      }
    });
  }

  checkForWidows(wfIndex, txtNodeIndex) {
    const textNode = this.txtNodes[wfIndex].nodes[txtNodeIndex];
    const spaces = WidowFixer.getNumSpaces(textNode);
    if (spaces) {
      const spaceIndices = WidowFixer.getIndicesOfAllSpaces(textNode);
      this.txtNodes[wfIndex].prevHeight = -1;
      this.getHeightUpToSpace(textNode, wfIndex, spaceIndices);
    } else if (txtNodeIndex > 0) {
      this.checkForWidows(wfIndex, txtNodeIndex - 1);
    }
  }

  getHeightUpToSpace(textNode, wfIndex, spaceIndices) {
    const start = spaceIndices[spaceIndices.length - 1];
    console.log(start);
    const end = textNode.nodeValue.length;
    console.log(end);
    const range = document.createRange();
    range.selectNodeContents(textNode);
    range.setStart(textNode, start);
    range.setEnd(textNode, end);
    const { height } = range.getBoundingClientRect();

    if (this.txtNodes[wfIndex].prevHeight > -1 && this.txtNodes[wfIndex].prevHeight !== height) {
      console.log(range.toString());
    } else {
      this.txtNodes[wfIndex].prevHeight = height;
      // this.txtNodes[wfIndex].lastSpaceChangeIndex = start;
      if (spaceIndices.length > 1) {
        const newSpaceIndices = spaceIndices.slice(0, -1);
        this.getHeightUpToSpace(textNode, wfIndex, newSpaceIndices);
      }
    }
  }

  static getIndicesOfAllSpaces(textNode) {
    const spaceIndices = [];
    for (let i = 0, len = textNode.nodeValue.length; i < len; i++) {
      if (textNode.nodeValue[i] === ' ') {
        spaceIndices.push(i);
      }
    }
    return spaceIndices;
  }

  static getNodeRangeHeight(textNode) {
    const nodeRange = document.createRange();
    nodeRange.selectNode(textNode);
    const { height } = nodeRange.getBoundingClientRect();
    return height;
  }

  static getNumSpaces(textNode) {
    const spaceMatches = textNode.textContent.match(/(\s)/g);
    if (spaceMatches) {
      return spaceMatches.length;
    }
    return 0;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const wf = new WidowFixer();
});
