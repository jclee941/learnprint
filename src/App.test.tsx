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
    expect(screen.getByText("입력, 생성, 검토, 내보내기를 한 흐름으로 정리합니다.")).toBeInTheDocument();
    expect(screen.getByText(/입력: 학습 경험\s*6개/)).toBeInTheDocument();
    expect(screen.getByText(/생성:\s*생성 대기/)).toBeInTheDocument();
    expect(screen.getByText(/검토·내보내기:\s*검토 전/)).toBeInTheDocument();
  });

  it("app:resume-workflow-updates-after-generation", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "이력서 생성" }));

    expect(screen.getByText(/생성:\s*검토 가능/)).toBeInTheDocument();
    expect(screen.getByText(/검토·내보내기:\s*내보내기 준비/)).toBeInTheDocument();
    expect(screen.getByText("완성된 학습 이력서")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "완성된 학습 이력서" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "이력서 내보내기 도구" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Markdown 내보내기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "JSON 내보내기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "증거 원장 내보내기" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "생성된 학습 이력서" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "HYCU AI 학습 에이전트 패널" })).toBeInTheDocument();
  });

  it("app:invalidates-resume-after-learning-items-change", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "이력서 생성" }));
    fireEvent.click(screen.getByRole("button", { name: "게임프로그래밍개발 삭제" }));

    expect(screen.queryByText(/생성:\s*검토 가능/)).not.toBeInTheDocument();
    expect(screen.queryByText("완성된 학습 이력서")).not.toBeInTheDocument();
    expect(screen.queryByText("완성된 학습 이력서가 준비되었습니다. 본문을 검토한 뒤 내보내기 도구를 사용하세요.")).not.toBeInTheDocument();
    expect(screen.getByText(/생성:\s*생성 대기/)).toBeInTheDocument();
  });

  it("app:restore-sample-restores-seed-and-invalidates-resume", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "이력서 생성" }));
    expect(screen.getByText(/생성:\s*검토 가능/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "샘플 불러오기" }));

    expect(screen.getByText(/입력: 학습 경험\s*6개/)).toBeInTheDocument();
    expect(screen.getByText("컴퓨터구조론")).toBeInTheDocument();
    expect(screen.queryByText(/생성:\s*검토 가능/)).toBeNull();
    expect(screen.queryByText("완성된 학습 이력서")).toBeNull();
    expect(screen.getByText(/생성:\s*생성 대기/)).toBeInTheDocument();
  });

  it("app:delete-all-clears-items-and-invalidates-resume", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "이력서 생성" }));
    expect(screen.getByText(/생성:\s*검토 가능/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "전체 삭제" }));

    expect(screen.getByText(/입력: 학습 경험\s*0개/)).toBeInTheDocument();
    expect(screen.queryByText(/생성:\s*검토 가능/)).toBeNull();
    expect(screen.queryByText("완성된 학습 이력서")).toBeNull();
    expect(screen.getByText(/생성:\s*생성 대기/)).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it("app:delete-all-cancel-keeps-items", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "전체 삭제" }));

    expect(screen.getByText(/입력: 학습 경험\s*6개/)).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it("app:shows-competency-coverage-after-generation", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "이력서 생성" }));

    expect(screen.getByText(/역량 \d\/6 커버리지/)).toBeInTheDocument();
  });
});
