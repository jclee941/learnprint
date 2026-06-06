import { useState } from "react";
import type { SyntheticEvent } from "react";

import { LEARNING_ITEM_TYPES } from "../../types/learning";
import type { LearningItemDraft, LearningItemType } from "../../types/learning";

interface LearningItemFormProps {
  onAdd: (draft: LearningItemDraft) => void;
}

const INITIAL_TYPE: LearningItemType = LEARNING_ITEM_TYPES[0];

export function LearningItemForm({ onAdd }: LearningItemFormProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<LearningItemType>(INITIAL_TYPE);
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");

  const isTitleEmpty = title.trim().length === 0;

  const resetForm = (): void => {
    setTitle("");
    setType(INITIAL_TYPE);
    setPeriod("");
    setDescription("");
    setEvidence("");
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (isTitleEmpty) {
      return;
    }

    onAdd({
      title: title.trim(),
      type,
      period: period.trim(),
      description: description.trim(),
      evidence: evidence.trim(),
    });
    resetForm();
  };

  return (
    <form className="learning-item-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="learning-title">제목</label>
        <input
          id="learning-title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="예: 데이터 분석 프로젝트"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="learning-type">유형</label>
          <select
            id="learning-type"
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value as LearningItemType)}
          >
            {LEARNING_ITEM_TYPES.map((itemType) => (
              <option key={itemType} value={itemType}>
                {itemType}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="learning-period">기간</label>
          <input
            id="learning-period"
            name="period"
            type="text"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            placeholder="예: 2025-1학기"
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="learning-description">설명</label>
        <textarea
          id="learning-description"
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="학습 과정, 맡은 역할, 해결한 문제를 적어주세요."
          rows={5}
        />
      </div>

      <div className="form-field">
        <label htmlFor="learning-evidence">증거/링크</label>
        <input
          id="learning-evidence"
          name="evidence"
          type="text"
          value={evidence}
          onChange={(event) => setEvidence(event.target.value)}
          placeholder="예: https://portfolio.example.com 또는 발표 자료 보유"
        />
      </div>

      <button className="primary-action" type="submit" disabled={isTitleEmpty}>
        학습 경험 추가
      </button>
    </form>
  );
}
