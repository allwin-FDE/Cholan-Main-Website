import { useState } from "react";
import PageHero from "../components/PageHero";
import { site, whatsappLink } from "../data/site";
import "./Contact.css";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  enquiryType: "Household order",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [sent, setSent] = useState(false);

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  // No backend yet — this hands the enquiry to WhatsApp so nothing is lost.
  const handleSubmit = (e) => {
    e.preventDefault();
    const text = [
      `New enquiry from the website`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      form.email && `Email: ${form.email}`,
      `Type: ${form.enquiryType}`,
      ``,
      form.message,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `https://wa.me/${site.phoneRaw}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener"
    );
    setSent(true);
    setForm(emptyForm);
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to us"
        lede="Household orders, bulk quotes or a question about a variety — we are happy to help."
      />

      <section className="section">
        <div className="container contact">
          <div className="contact__info">
            <h2>Reach us directly</h2>
            <p className="lede">
              The fastest way to get a reply is WhatsApp or a phone call.
            </p>

            <div className="infocard">
              <span className="infocard__label">Phone</span>
              <a href={`tel:${site.phoneRaw}`} className="infocard__value">
                {site.phone}
              </a>
              <span className="muted">{site.hours}</span>
            </div>

            <div className="infocard">
              <span className="infocard__label">Email</span>
              <a href={`mailto:${site.email}`} className="infocard__value">
                {site.email}
              </a>
            </div>

            <div className="infocard">
              <span className="infocard__label">Visit / Warehouse</span>
              <address className="infocard__value infocard__address">
                {site.address.line1}
                <br />
                {site.address.line2} – {site.address.pincode}
                <br />
                {site.address.state}
              </address>
            </div>

            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="btn btn--primary btn--block"
            >
              Message us on WhatsApp
            </a>

            <div className="ph map__ph">Google Map embed goes here</div>
          </div>

          <div className="contact__form">
            <h2>Send an enquiry</h2>
            {sent && (
              <p className="notice">
                Thanks — your enquiry was opened in WhatsApp. Send the message
                there and we will reply shortly.
              </p>
            )}
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Your name *</label>
                <input
                  id="name"
                  className="input"
                  required
                  value={form.name}
                  onChange={update("name")}
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    id="phone"
                    className="input"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={update("phone")}
                  />
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="type">Enquiry type</label>
                <select
                  id="type"
                  className="input"
                  value={form.enquiryType}
                  onChange={update("enquiryType")}
                >
                  <option>Household order</option>
                  <option>Bulk / wholesale</option>
                  <option>Distributor enquiry</option>
                  <option>Product question</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  className="input"
                  rows={6}
                  required
                  placeholder="Which varieties and quantities are you looking for?"
                  value={form.message}
                  onChange={update("message")}
                />
              </div>

              <button type="submit" className="btn btn--primary btn--block">
                Send enquiry
              </button>
              <p className="muted form__note">
                No backend is wired up yet — this opens WhatsApp with your
                message prefilled. Swap in a form service or API when ready.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
