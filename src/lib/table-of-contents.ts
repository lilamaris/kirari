interface Section {
  id: string;
  start: number;
  end: number;
}

class TableOfContent extends HTMLElement {
  mdSections: Section[] = [];
  tocSections: Section[] = [];
  tocElements: HTMLElement[] = [];
  tocWrapperElement: HTMLElement | null = null;
  viewportIndicator: HTMLElement | null = null;

  constructor() {
    super();
  }

  getViewportHeight() {
    const top = window.scrollY;
    const bottom = top + window.innerHeight;

    return { top, bottom };
  }

  getVisibleSectionsIndex() {
    const { top, bottom } = this.getViewportHeight();

    // this code will loop more as the page scrolls down
    let visibleSectionIdx = [];
    for (const [index, heading] of this.mdSections.entries()) {
      const start = heading.start;
      const end = heading.end;
      if (start > bottom) break;
      if (end >= top && start <= bottom) visibleSectionIdx.push(index);
    }

    return visibleSectionIdx;
  }

  buildSections(offsets: { id: string; top: number; height: number }[]) {
    return offsets
      .map((offset, i) => ({
        id: offset.id,
        start: offset.top,
        end:
          i < offsets.length - 1
            ? offsets[i + 1].top
            : offset.top + offset.height,
      }))
      .sort((a, b) => a.start - b.start);
  }

  getRelativeOffset(elements: HTMLElement[]) {
    return elements.map((el) => {
      return {
        id: el.id,
        top: el.offsetTop,
        height: el.offsetHeight,
      };
    });
  }

  getGlobalOffset(elements: HTMLElement[]) {
    return elements.map((el) => {
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY;
      return {
        id: el.id,
        top: rect.top + scrollY,
        height: rect.height + scrollY,
      };
    });
  }

  buildSection() {
    const headingElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".prose :where(h1, h2, h3, h4, h5, h6)",
      ),
    );
    const headingOffsets = this.getGlobalOffset(headingElements);

    const tocHeadingElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        "#toc-wrapper ul li:has(a[href^='#'])",
      ),
    );
    const tocHeadingOffset = this.getRelativeOffset(tocHeadingElements);

    this.mdSections = this.buildSections(headingOffsets);
    this.tocSections = this.buildSections(tocHeadingOffset);
    this.tocElements = tocHeadingElements;
  }

  updateIndicator() {
    if (this.mdSections.length === 0) return [];
    const visibleSectionIdx = this.getVisibleSectionsIndex();
    const length = visibleSectionIdx.length;

    if (length == 0) return;
    const startIdx = visibleSectionIdx[0];
    const endIdx = visibleSectionIdx[length - 1];

    const top = this.tocSections[startIdx].start;
    const bottom = this.tocSections[endIdx].end;

    this.viewportIndicator?.setAttribute(
      "style",
      `top: ${top}px; height: ${bottom - top}px`,
    );

    this.tocElements.forEach((el, index) => {
      if (visibleSectionIdx.includes(index)) {
        el.classList.add("text-foreground/80");
      } else {
        el.classList.remove("text-foreground/80");
      }
    });

    this.tocWrapperElement?.scrollTo({
      top: top * 0.87,
      left: 0,
      behavior: "smooth",
    });
  }

  handleScroll = () => {
    this.updateIndicator();
  };

  handleResize = () => {
    this.buildSection();
    this.updateIndicator();
  };

  connectedCallback() {
    this.buildSection();

    this.tocWrapperElement = this.querySelector("#toc-wrapper");
    this.viewportIndicator = this.querySelector("#viewport-indicator");

    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("resize", this.handleResize, { passive: true });

    this.updateIndicator();
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
  }
}

if (!customElements.get("table-of-contents")) {
  customElements.define("table-of-contents", TableOfContent);
}
