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
      if (this.txtNodes[i].hasWidow) {
        this.addSpaces(this.txtNodes[i]);
        // this.increaseRightPadding(this.elements[i]);
      }
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
      this.getHeightToSpace(textNode, wfIndex, spaceIndices);
    } else if (txtNodeIndex > 0) {
      this.checkForWidows(wfIndex, txtNodeIndex - 1);
    }
  }

  getHeightToSpace(textNode, wfIndex, spaceIndices, isLeadingText = false) {
    const start = spaceIndices[spaceIndices.length - 1];
    const end = textNode.nodeValue.length;
    const range = document.createRange();
    range.selectNodeContents(textNode);
    if (isLeadingText) {
      range.setStart(textNode, 0);
    } else {
      range.setStart(textNode, start);
    }
    range.setEnd(textNode, end);
    const { height } = range.getBoundingClientRect();
    if (isLeadingText) {
      this.txtNodes[wfIndex].hasWidow = this.txtNodes[wfIndex].prevHeight === height ? 0 : 1;
      return;
    }

    if (this.txtNodes[wfIndex].prevHeight === undefined) {
      this.txtNodes[wfIndex].prevHeight = height;
    }

    if (spaceIndices.length > 1) {
      if (this.txtNodes[wfIndex].prevHeight === height) {
        const newSpaceIndices = spaceIndices.slice(0, -1);
        this.getHeightToSpace(textNode, wfIndex, newSpaceIndices);
      } else {
        const lastWordsLength = range.toString().split(' ').filter(Boolean).slice(1).length;
        this.txtNodes[wfIndex].hasWidow = lastWordsLength > this.wordThreshold ? 0 : 1;
      }
    } else if (spaceIndices[0] > 0) {
      this.getHeightToSpace(textNode, wfIndex, spaceIndices, true);
    }
  }

  addSpaces(textNode) {
    textNode.nodes.forEach((txtNode) => {
      txtNode.nodeValue = txtNode.nodeValue.replace(/\s/g, ' \u00A0');
    });
  }

  // increaseRightPadding(el) {
    // const paddingRight = window.getComputedStyle(el).paddingRight;
    // el.style.paddingRight = parseInt(paddingRight, 10) + 30 + "px";
  // }


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
