export interface Section {
  id: string;
  start: number;
  end: number;
}

export interface SectionOffset {
  id: string;
  top: number;
  height: number;
}

export interface ViewportRange {
  top: number;
  bottom: number;
}

export const buildSections = (
  offsets: SectionOffset[],
  fallbackEnd?: number,
): Section[] => {
  if (offsets.length === 0) return [];

  const sortedOffsets = [...offsets].sort((a, b) => a.top - b.top);

  return sortedOffsets.map((offset, index) => {
    const nextOffset = sortedOffsets[index + 1];
    const naturalEnd = offset.top + offset.height;
    const end = nextOffset
      ? nextOffset.top
      : Math.max(fallbackEnd ?? naturalEnd, naturalEnd);

    return {
      id: offset.id,
      start: offset.top,
      end,
    };
  });
};

export const getVisibleSectionsIndex = (
  sections: Section[],
  viewport: ViewportRange,
): number[] => {
  const visibleSectionIdx: number[] = [];

  for (const [index, section] of sections.entries()) {
    if (section.start > viewport.bottom) break;
    if (section.end >= viewport.top && section.start <= viewport.bottom) {
      visibleSectionIdx.push(index);
    }
  }

  return visibleSectionIdx;
};
