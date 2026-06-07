import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("app:shows-submission-workflow", () => {
    render(<App />);

    expect(screen.getByRole("region", { name: "제출물 제작 흐름" })).toBeInTheDocument();
    expect(screen.getByText("한 페이지에서 입력부터 제출물 생성까지 끝내기")).toBeInTheDocument();
    expect(screen.getByText("등록된 학습 경험 6개")).toBeInTheDocument();
    expect(screen.getByText("출력 전")).toBeInTheDocument();
  });

  it("app:submission-workflow-updates-after-generation", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "이력서 생성" }));

    expect(screen.getByText("제출물 준비 완료")).toBeInTheDocument();
    expect(screen.getByText("최종 제출물 패키지")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Markdown 내보내기" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "생성된 학습 이력서" })).toBeInTheDocument();
  });

  it("app:invalidates-submission-after-learning-items-change", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "이력서 생성" }));
    fireEvent.click(screen.getByRole("button", { name: "게임프로그래밍개발 삭제" }));

    expect(screen.queryByText("제출물 준비 완료")).not.toBeInTheDocument();
    expect(screen.queryByText("최종 제출물 패키지")).not.toBeInTheDocument();
    expect(screen.queryByText("생성된 이력서가 준비되어 있습니다.")).not.toBeInTheDocument();
    expect(screen.getByText("출력 전")).toBeInTheDocument();
  });

  it("app:restore-sample-restores-seed-and-invalidates-submission", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "이력서 생성" }));
    expect(screen.getByText("제출물 준비 완료")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "샘플 불러오기" }));

    expect(screen.getByText("등록된 학습 경험 6개")).toBeInTheDocument();
    expect(screen.getByText("컴퓨터구조론")).toBeInTheDocument();
    expect(screen.queryByText("제출물 준비 완료")).toBeNull();
    expect(screen.queryByText("최종 제출물 패키지")).toBeNull();
    expect(screen.getByText("출력 전")).toBeInTheDocument();
  });

  it("app:delete-all-clears-items-and-invalidates-submission", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "이력서 생성" }));
    expect(screen.getByText("제출물 준비 완료")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "전체 삭제" }));

    expect(screen.getByText("등록된 학습 경험 0개")).toBeInTheDocument();
    expect(screen.queryByText("제출물 준비 완료")).toBeNull();
    expect(screen.queryByText("최종 제출물 패키지")).toBeNull();
    expect(screen.getByText("출력 전")).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it("app:delete-all-cancel-keeps-items", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "전체 삭제" }));

    expect(screen.getByText("등록된 학습 경험 6개")).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it("app:shows-competency-coverage-after-generation", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "이력서 생성" }));

    expect(screen.getByText(/역량 \d\/6 커버리지/)).toBeInTheDocument();
  });
});
