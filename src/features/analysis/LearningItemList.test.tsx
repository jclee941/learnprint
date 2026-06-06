import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LEARNING_ITEM_TYPES, type LearningItem } from "../../types/learning";
import { LearningItemList } from "./LearningItemList";

function makeItem(overrides: Partial<LearningItem> = {}): LearningItem {
  return {
    id: "item-1",
    title: "데이터 분석 프로젝트",
    type: LEARNING_ITEM_TYPES[2],
    period: "2026-1학기",
    description: "설명",
    evidence: "",
    createdAt: 1767225600000,
    ...overrides,
  };
}

describe("LearningItemList", () => {
  it("learning-item-list:delete-button-has-item-title-label", () => {
    render(<LearningItemList items={[makeItem()]} onRemove={vi.fn()} />);
    // Visible text stays "삭제" but accessible name is item-specific.
    const button = screen.getByRole("button", { name: "데이터 분석 프로젝트 삭제" });
    expect(button).toBeInTheDocument();
    expect(button.textContent).toContain("삭제");
  });

  it("learning-item-list:only-http-and-https-evidence-becomes-link", () => {
    render(
      <LearningItemList
        items={[
          makeItem({ id: "a", title: "링크항목", evidence: "https://example.com/cert" }),
          makeItem({ id: "b", title: "비링크항목", evidence: "http-not-a-real-url" }),
        ]}
        onRemove={vi.fn()}
      />,
    );
    // https:// → anchor
    const link = screen.getByRole("link", { name: "https://example.com/cert" });
    expect(link).toHaveAttribute("href", "https://example.com/cert");
    // "http-not-a-real-url" must NOT be a link
    expect(
      screen.queryByRole("link", { name: "http-not-a-real-url" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("http-not-a-real-url")).toBeInTheDocument();
  });
});
