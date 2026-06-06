import { LEARNING_ITEM_TYPES, type LearningItem } from "../../types/learning";
import { clearLearningItems, hasStoredLearningItems, loadLearningItems, saveLearningItems, STORAGE_KEY } from "./storage";

const learningItems: LearningItem[] = [
  {
    id: "item-lecture-1",
    title: "React 상태 관리 강의",
    type: LEARNING_ITEM_TYPES[0],
    period: "2026-01-01 ~ 2026-01-15",
    description: "컴포넌트 상태와 props 흐름을 학습했다.",
    evidence: "https://example.com/react-lecture-certificate",
    createdAt: 1767225600000,
  },
  {
    id: "item-project-1",
    title: "학습 포트폴리오 프로젝트",
    type: LEARNING_ITEM_TYPES[2],
    period: "2026-02-01 ~ 2026-02-28",
    description: "학습 기록을 정리하는 웹 애플리케이션을 제작했다.",
    evidence: "https://github.com/example/learning-portfolio",
    createdAt: 1769904000000,
  },
];

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("storage:load-empty-returns-default", () => {
    expect(loadLearningItems()).toEqual([]);
  });

  it("storage:save-and-load-learning-items", () => {
    saveLearningItems(learningItems);

    expect(loadLearningItems()).toEqual(learningItems);
  });

  it("storage:corrupt-json-returns-default", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");

    expect(() => loadLearningItems()).not.toThrow();
    expect(loadLearningItems()).toEqual([]);
  });

  it("storage:clear-removes-learning-items", () => {
    saveLearningItems(learningItems);
    clearLearningItems();

    expect(loadLearningItems()).toEqual([]);
  });

  it("storage:does-not-require-network-or-env", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    try {
      saveLearningItems(learningItems);
      expect(loadLearningItems()).toEqual(learningItems);
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("storage:load-returns-default-when-getitem-throws", () => {
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });
    try {
      expect(() => loadLearningItems()).not.toThrow();
      expect(loadLearningItems()).toEqual([]);
      expect(() => hasStoredLearningItems()).not.toThrow();
      expect(hasStoredLearningItems()).toBe(false);
    } finally {
      getItem.mockRestore();
    }
  });

  it("storage:save-and-clear-noop-when-storage-throws", () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    const removeItem = vi
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });
    try {
      expect(() => saveLearningItems(learningItems)).not.toThrow();
      expect(() => clearLearningItems()).not.toThrow();
    } finally {
      setItem.mockRestore();
      removeItem.mockRestore();
    }
  });
});
