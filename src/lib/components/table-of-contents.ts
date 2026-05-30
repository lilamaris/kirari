import {
  buildSections,
  getVisibleSectionsIndex,
  type Section,
} from "./table-of-contents-core";

class TableOfContent extends HTMLElement {
  mdSections: Section[] = [];
  tocSections: Section[] = [];
  tocElements: HTMLElement[] = [];
  tocWrapperElement: HTMLElement | null = null;
  viewportIndicator: HTMLElement | null = null;
  scrollFrame: number | null = null;
  refreshFrame: number | null = null;
  resizeObserver: ResizeObserver | null = null;
  observedContentElement: HTMLElement | null = null;
  observedTocListElement: HTMLElement | null = null;

  constructor() {
    super();
  }

  getViewportHeight() {
    const top = window.scrollY;
    const bottom = top + window.innerHeight;

    return { top, bottom };
  }

  getContentBottom(headingElements: HTMLElement[]) {
    const lastHeading = headingElements[headingElements.length - 1];
    if (!lastHeading) return undefined;

    const contentRoot =
      lastHeading.closest<HTMLElement>("article") ?? lastHeading.parentElement;
    if (!contentRoot) return undefined;

    this.syncObservedElement("observedContentElement", contentRoot);

    const rect = contentRoot.getBoundingClientRect();
    return rect.bottom + window.scrollY;
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
        height: rect.height,
      };
    });
  }

  getHeadingId(link: HTMLAnchorElement) {
    return decodeURIComponent(link.hash.replace(/^#/, ""));
  }

  getSectionPairs() {
    const tocLinks = Array.from(
      this.querySelectorAll<HTMLAnchorElement>("#toc-wrapper a[href^='#']"),
    );

    return tocLinks
      .map((link) => {
        const id = this.getHeadingId(link);
        const heading = document.getElementById(id);
        const tocElement = link.closest<HTMLElement>("li");
        if (!heading || !tocElement) return null;

        return { id, heading, tocElement };
      })
      .filter((pair): pair is NonNullable<typeof pair> => pair != null);
  }

  syncObservedElement(
    key: "observedContentElement" | "observedTocListElement",
    element: HTMLElement | null,
  ) {
    if (!this.resizeObserver) return;
    const current = this[key];
    if (current === element) return;
    if (current) this.resizeObserver.unobserve(current);
    if (element) this.resizeObserver.observe(element);
    this[key] = element;
  }

  scheduleRefresh = () => {
    if (this.refreshFrame != null) return;
    this.refreshFrame = window.requestAnimationFrame(() => {
      this.refreshFrame = null;
      this.buildSection();
      this.updateIndicator();
    });
  };

  resetIndicator() {
    this.viewportIndicator?.setAttribute("style", "top: 0; height: 0");
    this.tocElements.forEach((el) => el.classList.remove("text-foreground/80"));
  }

  buildSection() {
    const sectionPairs = this.getSectionPairs();
    const headingElements = sectionPairs.map((pair) => pair.heading);
    const tocHeadingElements = sectionPairs.map((pair) => pair.tocElement);
    const headingOffsets = this.getGlobalOffset(headingElements);
    const tocHeadingOffset = this.getRelativeOffset(tocHeadingElements);
    const contentBottom =
      headingElements.length > 0
        ? this.getContentBottom(headingElements)
        : undefined;
    const tocListElement = this.querySelector<HTMLElement>("#toc-wrapper ul");

    if (headingElements.length === 0) {
      this.syncObservedElement("observedContentElement", null);
    }
    this.syncObservedElement("observedTocListElement", tocListElement);

    this.mdSections = buildSections(headingOffsets, contentBottom);
    this.tocSections = buildSections(tocHeadingOffset);
    this.tocElements = tocHeadingElements;
  }

  updateIndicator() {
    if (this.mdSections.length === 0 || this.tocSections.length === 0) {
      this.resetIndicator();
      return;
    }
    const visibleSectionIdx = getVisibleSectionsIndex(
      this.mdSections,
      this.getViewportHeight(),
    );
    if (visibleSectionIdx.length === 0) {
      this.resetIndicator();
      return;
    }
    const startIdx = visibleSectionIdx[0];
    const endIdx = visibleSectionIdx[visibleSectionIdx.length - 1];
    const startSection = this.tocSections[startIdx];
    const endSection = this.tocSections[endIdx];
    if (!startSection || !endSection) return;

    const top = startSection.start;
    const bottom = endSection.end;

    this.viewportIndicator?.setAttribute(
      "style",
      `top: ${top}px; height: ${bottom - top}px`,
    );

    const visibleSectionSet = new Set(visibleSectionIdx);
    this.tocElements.forEach((el, index) => {
      if (visibleSectionSet.has(index)) {
        el.classList.add("text-foreground/80");
      } else {
        el.classList.remove("text-foreground/80");
      }
    });

    const wrapper = this.tocWrapperElement;
    if (!wrapper) return;
    const currentTop = wrapper.scrollTop;
    const currentBottom = currentTop + wrapper.clientHeight;
    if (top < currentTop || bottom > currentBottom) {
      wrapper.scrollTo({
        top: Math.max(0, top - wrapper.clientHeight * 0.2),
        left: 0,
        behavior: "auto",
      });
    }
  }

  handleScroll = () => {
    if (this.scrollFrame != null) return;
    this.scrollFrame = window.requestAnimationFrame(() => {
      this.scrollFrame = null;
      this.updateIndicator();
    });
  };

  handleResize = () => {
    this.buildSection();
    this.updateIndicator();
  };

  connectedCallback() {
    this.tocWrapperElement = this.querySelector("#toc-wrapper");
    this.viewportIndicator = this.querySelector("#viewport-indicator");
    this.resizeObserver = new ResizeObserver(this.scheduleRefresh);

    this.buildSection();

    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("resize", this.handleResize, { passive: true });
    window.addEventListener("load", this.handleResize, { passive: true });

    this.updateIndicator();
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("load", this.handleResize);
    if (this.scrollFrame != null) {
      window.cancelAnimationFrame(this.scrollFrame);
      this.scrollFrame = null;
    }
    if (this.refreshFrame != null) {
      window.cancelAnimationFrame(this.refreshFrame);
      this.refreshFrame = null;
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.observedContentElement = null;
    this.observedTocListElement = null;
  }
}

if (!customElements.get("table-of-contents")) {
  customElements.define("table-of-contents", TableOfContent);
}
