import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import SectionHead from "../components/SectionHead";
import "./Process.css";

const stages = [
  {
    step: "01",
    title: "Sourcing from the farm",
    text: "We buy paddy and millets directly from farmer families across the Cauvery delta and the Kongu belt. Buying direct means we can inspect the crop, know the variety for certain, and pay the grower properly.",
    points: ["Farm visits before purchase", "Variety verified at source", "Paid direct to the farmer"],
  },
  {
    step: "02",
    title: "Sun drying",
    text: "Grain is dried the traditional way until the moisture is right. Get this wrong and the rice breaks in the mill or spoils in storage — so we do not rush it.",
    points: ["Moisture tested before milling", "No forced heat drying", "Reduces breakage in milling"],
  },
  {
    step: "03",
    title: "Small-batch milling",
    text: "We mill in small batches and stop short of the over-polishing that strips the bran. That is why our rice looks a little less uniform than supermarket rice — and carries more of its nutrition.",
    points: ["Minimal polishing", "No talc or artificial glaze", "Batch-wise quality checks"],
  },
  {
    step: "04",
    title: "Grading and destoning",
    text: "Grain is sieved, destoned and graded by size so what reaches you is clean and consistent. Broken grain and foreign matter are separated out at this stage.",
    points: ["Mechanical destoning", "Size-graded", "Broken grain separated"],
  },
  {
    step: "05",
    title: "Packing fresh",
    text: "We pack against confirmed orders rather than filling a warehouse. Food-grade packaging, sealed, and labelled with the pack date.",
    points: ["Packed to order", "Food-grade material", "Pack date on every bag"],
  },
  {
    step: "06",
    title: "Delivery",
    text: "Household orders go out across Tamil Nadu. Bulk orders for messes, caterers and retailers run on a standing schedule agreed with you.",
    points: ["Tamil Nadu-wide delivery", "Standing bulk schedules", "Free above ₹1,000 in Coimbatore"],
  },
];

export default function Process() {
  return (
    <>
      <PageHero
        eyebrow="Our process"
        title="From paddy field to your plate"
        lede="Six stages, all of them ours. Here is exactly what happens between the farm and the bag on your kitchen shelf."
      />

      <section className="section">
        <div className="container">
          <div className="stages">
            {stages.map((s, i) => (
              <article
                key={s.step}
                className={`stage${i % 2 === 1 ? " stage--flip" : ""}`}
              >
                <div className="stage__media">
                  <div className="ph stage__ph">Stage {s.step} photograph</div>
                </div>
                <div className="stage__copy">
                  <span className="stage__num">{s.step}</span>
                  <h2>{s.title}</h2>
                  <p>{s.text}</p>
                  <ul className="stage__points">
                    {s.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHead
            eyebrow="Quality"
            title="What we test for"
            lede="Every batch is checked before it is packed."
            center
          />
          <div className="grid grid--4">
            {[
              { k: "Moisture", v: "Measured before and after milling" },
              { k: "Foreign matter", v: "Destoned and sieved out" },
              { k: "Broken grain", v: "Separated and graded" },
              { k: "Aroma & colour", v: "Checked by hand, batch by batch" },
            ].map((t) => (
              <div key={t.k} className="qcard">
                <h3>{t.k}</h3>
                <p>{t.v}</p>
              </div>
            ))}
          </div>
          <div className="center" style={{ marginTop: 44 }}>
            <Link to="/products" className="btn btn--primary">
              See the products
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
