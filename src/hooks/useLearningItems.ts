import { useEffect, useState } from "react";

import { hasStoredLearningItems, loadLearningItems, saveLearningItems } from "../lib/storage";
import type { LearningItem, LearningItemDraft } from "../types/learning";
import { createHycuSeedItems } from "../data/hycu-seed";
import { createId } from "../lib/id";

interface UseLearningItemsResult {
  items: LearningItem[];
  addItem: (draft: LearningItemDraft) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  restoreSample: () => void;
}

export function useLearningItems(): UseLearningItemsResult {
  const [items, setItems] = useState<LearningItem[]>(() =>
    hasStoredLearningItems() ? loadLearningItems() : createHycuSeedItems(),
  );

  useEffect(() => {
    saveLearningItems(items);
  }, [items]);

  const addItem = (draft: LearningItemDraft): void => {
    setItems((currentItems) => [
      {
        ...draft,
        id: createId(),
        createdAt: Date.now(),
      },
      ...currentItems,
    ]);
  };

  const removeItem = (id: string): void => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const clearAll = (): void => {
    setItems([]);
  };

  const restoreSample = (): void => {
    setItems(createHycuSeedItems());
  };

  return { items, addItem, removeItem, clearAll, restoreSample };
}

