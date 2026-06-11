import type { LearningResume } from "../../types/resume";
import { createFinalOutputSummary } from "./finalOutputSummary";

interface ResumeViewProps {
  resume: LearningResume;
}

export function ResumeView({ resume }: ResumeViewProps) {
  const generatedDate = Number.isFinite(resume.generatedAt)
    ? new Date(resume.generatedAt).toLocaleDateString("ko-KR")
    : "—";
  const finalOutputSummary = createFinalOutputSummary(resume);

  return (
    <article className="resume" aria-label="생성된 학습 이력서">
      <header className="resume-header">
        <p className="resume-generated">생성일: {generatedDate}</p>
        <h2>{resume.title}</h2>
        <p className="resume-summary">{resume.summary}</p>
      </header>

      <section className="resume-competency" aria-label="최종 산출물 패키지">
        <h3>최종 산출물 패키지</h3>
        <p>{finalOutputSummary.exportStatus}</p>
        <ul className="resume-evidence-list">
          <li className="resume-evidence">학습 경험 {finalOutputSummary.itemCount}개</li>
          <li className="resume-evidence">역량 {finalOutputSummary.competencyCount}개</li>
          <li className="resume-evidence">증거 문장 {finalOutputSummary.evidenceCount}개</li>
          <li className="resume-evidence">증거 링크 {finalOutputSummary.linkedEvidenceCount}개</li>
        </ul>
      </section>

      <section className="resume-competencies" aria-label="역량별 학습 증거">
        {resume.competencies.map((competency) => (
          <section className="resume-competency" key={competency.key}>
            <h3>{competency.label}</h3>
            <p>{competency.summary}</p>

            <ul className="resume-evidence-list">
              {competency.evidence.map((evidence) => (
                <li className="resume-evidence" key={evidence.itemId}>
                  <article>
                    <h4>{evidence.title}</h4>
                    <p className="resume-evidence-meta">
                      <span className="type-badge">{evidence.type}</span>
                      {evidence.period && <span>{evidence.period}</span>}
                    </p>
                    <p>{evidence.snippet}</p>
                    {evidence.link && (
                      <a href={evidence.link} target="_blank" rel="noreferrer">
                        {evidence.link}
                      </a>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>
    </article>
  );
}
