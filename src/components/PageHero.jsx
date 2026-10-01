import "./PageHero.css";

// Compact banner used at the top of every inner page.
export default function PageHero({ eyebrow, title, lede }) {
  return (
    <section className="pagehero">
      <div className="container">
        {eyebrow && <span className="eyebrow pagehero__eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {lede && <p className="lede pagehero__lede">{lede}</p>}
      </div>
    </section>
  );
}
