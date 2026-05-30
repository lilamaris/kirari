import { describe, expect, it } from "vitest";
import {
  buildSections,
  getVisibleSectionsIndex,
} from "./table-of-contents-core";

describe("buildSections", () => {
  it("extends the last section to the content bottom when provided", () => {
    const sections = buildSections(
      [
        { id: "intro", top: 120, height: 32 },
        { id: "details", top: 300, height: 28 },
      ],
      860,
    );

    expect(sections).toEqual([
      { id: "intro", start: 120, end: 300 },
      { id: "details", start: 300, end: 860 },
    ]);
  });

  it("sorts offsets before deriving section boundaries", () => {
    const sections = buildSections([
      { id: "third", top: 600, height: 20 },
      { id: "first", top: 100, height: 20 },
      { id: "second", top: 300, height: 20 },
    ]);

    expect(sections).toEqual([
      { id: "first", start: 100, end: 300 },
      { id: "second", start: 300, end: 600 },
      { id: "third", start: 600, end: 620 },
    ]);
  });
});

describe("getVisibleSectionsIndex", () => {
  it("keeps the last section visible through the end of the content", () => {
    const sections = buildSections(
      [
        { id: "intro", top: 120, height: 32 },
        { id: "details", top: 300, height: 28 },
      ],
      860,
    );

    expect(
      getVisibleSectionsIndex(sections, {
        top: 700,
        bottom: 840,
      }),
    ).toEqual([1]);
  });
});
