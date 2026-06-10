import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("app:shows-resume-workflow", () => {
    render(<App />);

    expect(screen.getByRole("region", { name: "이력서 만들기 흐름" })).toBeInTheDocument();
    expect(screen.getByText("한 페이지에서 입력부터 이력서 생성까지 끝내기")).toBeInTheDocument();
    expect(screen.getByText("등록된 학습 경험 6개")).toBeInTheDocument();
    expect(screen.getByText("출력 전")).toBeInTheDocument();
  });

  it("app:resume-workflow-updates-after-generation", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "이력서 생성" }));

    expect(screen.getByText("이력서 준비 완료")).toBeInTheDocument();
    expect(screen.getByText("완성된 학습 이력서")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Markdown 내보내기" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "생성된 학습 이력서" })).toBeInTheDocument();
  });

  it("app:invalidates-resume-after-learning-items-change", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "이력서 생성" }));
    fireEvent.click(screen.getByRole("button", { name: "게임프로그래밍개발 삭제" }));

    expect(screen.queryByText("이력서 준비 완료")).not.toBeInTheDocument();
    expect(screen.queryByText("완성된 학습 이력서")).not.toBeInTheDocument();
    expect(screen.queryByText("생성된 이력서가 준비되어 있습니다.")).not.toBeInTheDocument();
    expect(screen.getByText("출력 전")).toBeInTheDocument();
  });

  it("app:restore-sample-restores-seed-and-invalidates-resume", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "이력서 생성" }));
    expect(screen.getByText("이력서 준비 완료")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "샘플 불러오기" }));

    expect(screen.getByText("등록된 학습 경험 6개")).toBeInTheDocument();
    expect(screen.getByText("컴퓨터구조론")).toBeInTheDocument();
    expect(screen.queryByText("이력서 준비 완료")).toBeNull();
    expect(screen.queryByText("완성된 학습 이력서")).toBeNull();
    expect(screen.getByText("출력 전")).toBeInTheDocument();
  });

  it("app:delete-all-clears-items-and-invalidates-resume", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "이력서 생성" }));
    expect(screen.getByText("이력서 준비 완료")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "전체 삭제" }));

    expect(screen.getByText("등록된 학습 경험 0개")).toBeInTheDocument();
    expect(screen.queryByText("이력서 준비 완료")).toBeNull();
    expect(screen.queryByText("완성된 학습 이력서")).toBeNull();
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
