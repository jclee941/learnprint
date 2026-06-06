import type { LearningItem } from "../../types/learning";

interface LearningItemListProps {
  items: LearningItem[];
  onRemove: (id: string) => void;
}

export function LearningItemList({ items, onRemove }: LearningItemListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="learning-item-list" aria-label="등록된 학습 경험 목록">
      {items.map((item) => (
        <article className="item-card" key={item.id}>
          <div className="item-card-header">
            <div>
              <h3>{item.title}</h3>
              {item.period && <p className="item-period">{item.period}</p>}
            </div>
            <span className="type-badge">{item.type}</span>
          </div>

          {item.description && <p className="item-description">{item.description}</p>}

          {item.evidence && (
            <p className="item-evidence">
              <span>증거: </span>
              {item.evidence.startsWith("http") ? (
                <a href={item.evidence} target="_blank" rel="noreferrer">
                  {item.evidence}
                </a>
              ) : (
                <span>{item.evidence}</span>
              )}
            </p>
          )}

          <button className="secondary-action" type="button" onClick={() => onRemove(item.id)}>
            삭제
          </button>
        </article>
      ))}
    </section>
  );
}
