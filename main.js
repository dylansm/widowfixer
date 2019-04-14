class WidowFixer {
  constructor() {
    if (window.NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = Array.prototype.forEach;
    }
    this.wordThreshold = 1;
    this.maxSpacing = 8;
    // this.elements = [...document.querySelectorAll('.wf')];
    this.elements = [].slice.call(document.querySelectorAll(".wf"));
    this.addRequiredCSS();
    this.txtNodes = {};
    this.inspectElements();
    this.initResizeListener();
  }

  addRequiredCSS() {
    this.elements.forEach((el) => {
      const wfEl = el;
      wfEl.style.whiteSpace = 'pre-line';
    });
  }

  inspectElements() {
    this.elements.forEach((wfEl, i) => {
      this.txtNodes[i] = { nodes: [] };
      this.downwardTraverseChildren(wfEl, i);
      this.checkAndAdjust(i, true);
    });
  }

  checkAndAdjust(i, shouldReset = false) {
    let curSpacing = 0;
    if (shouldReset) {
      this.elements[i].style.wordSpacing = '0px';
    } else {
      curSpacing = parseInt(window.getComputedStyle(this.elements[i]).wordSpacing, 10);
    }
    this.checkForWidows(i, this.txtNodes[i].nodes.length - 1);
    if (this.txtNodes[i].hasWidow && curSpacing < this.maxSpacing) {
      WidowFixer.increaseWordSpacing(this.elements[i], curSpacing);
      this.checkAndAdjust(i);
    } else if (this.txtNodes[i].hasWidow) {
      this.elements[i].style.wordSpacing = '0px';
    }
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

  initResizeListener() {
    window.addEventListener('resize', WidowFixer.debounce(() => {
      let i = this.elements.length;
      while (i--) {
        this.checkAndAdjust(i, true);
      }
    }, 100));
  }

  static increaseWordSpacing(el, curSpacing) {
    const newSpacing = curSpacing + 1;
    const wfEl = el;
    wfEl.style.wordSpacing = `${newSpacing}px`;
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

  static debounce(fn, time) {
    let timeout;
    return (...args) => {
      const functionCall = () => fn.apply(this, args);
      clearTimeout(timeout);
      timeout = setTimeout(functionCall, time);
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  (() => new WidowFixer())();
});
