import type { LearningResume } from "../../types/resume";

interface ResumeViewProps {
  resume: LearningResume;
}

export function ResumeView({ resume }: ResumeViewProps) {
  const generatedDate = new Date(resume.generatedAt).toLocaleDateString("ko-KR");

  return (
    <article className="resume" aria-label="생성된 학습 이력서">
      <header className="resume-header">
        <p className="resume-generated">생성일: {generatedDate}</p>
        <h2>{resume.title}</h2>
        <p className="resume-summary">{resume.summary}</p>
      </header>

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
