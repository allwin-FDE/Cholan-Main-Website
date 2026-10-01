export default function SectionHead({ eyebrow, title, lede, center = false }) {
  return (
    <div className={`section-head${center ? " section-head--center" : ""}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {lede && <p className="lede">{lede}</p>}
    </div>
  );
}
