import React from "react";
import { useMemo, useState } from "react";
import { categories, packagingNote, products } from "./data/products";
import { sendEnquiry } from "./services/api";

const image = (url, alt, className = "") => (
  <img className={className} src={url} alt={alt} loading="lazy" />
);

function Brand({ light = false }) {
  return (
    <a
      className={`brand ${light ? "brand-light" : ""}`}
      href="#home"
      aria-label="INDKAN home"
    >
      <span className="brand-mark">I</span>
      <span>
        <b>INDKAN</b>
        <small>WORLD WIDE EXIM LLC</small>
      </span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    ["About us", "#about"],
    ["Products", "#products"],
    ["Packaging & supply", "#supply"],
    ["Contact", "#contact"],
  ];
  return (
    <header className="header">
      <div className="nav-wrap">
        <Brand />
        <button
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <span />
          <span />
        </button>
        <nav className={open ? "nav-links open" : "nav-links"}>
          {links.map(([name, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {name}
            </a>
          ))}
          <a
            className="button button-small"
            href="#enquire"
            onClick={() => setOpen(false)}
          >
            Enquire now <span>↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

function EnquiryForm({ selectedProduct, onSuccess }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const initial = {
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    buyerType: "",
    category: "",
    product: selectedProduct || "",
    quantity: "",
    packaging: "",
    message: "",
  };
  const [form, setForm] = useState(initial);
  const update = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });
  const validate = () => {
    const next = {};
    [
      "fullName",
      "companyName",
      "email",
      "phone",
      "country",
      "city",
      "buyerType",
      "category",
    ].forEach((key) => {
      if (!form[key].trim()) next[key] = "This field is required.";
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid business email.";
    if (form.phone && !/^\+?[\d\s().-]{7,20}$/.test(form.phone))
      next.phone = "Include your country code and a valid phone number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    setMessage("");
    try {
      const result = await sendEnquiry(form);
      setStatus("success");
      setMessage(
        result.message || "Thank you. Your enquiry has been received.",
      );
      setForm(initial);
      onSuccess?.();
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };
  const field = (
    name,
    label,
    type = "text",
    required = true,
    options = null,
  ) => (
    <label className="field" key={name}>
      <span>
        {label}
        {required && <i> *</i>}
      </span>
      {options ? (
        <select name={name} value={form[name]} onChange={update}>
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          value={form[name]}
          onChange={update}
          placeholder={
            name === "phone"
              ? "+91 00000 00000"
              : `Enter ${label.toLowerCase()}`
          }
        />
      )}
      {errors[name] && <small className="field-error">{errors[name]}</small>}
    </label>
  );
  return (
    <form className="enquiry-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        {field("fullName", "Full name")}
        {field("companyName", "Company name")}
        {field("email", "Business email", "email")}
        {field("phone", "Phone with country code", "tel")}
        {field("country", "Country")}
        {field("city", "City")}
        {field("buyerType", "Buyer type", "text", true, [
          "Wholesaler",
          "Distributor",
          "Retailer",
          "Bulk buyer",
          "Importer",
          "Exporter",
        ])}
        {field(
          "category",
          "Product category",
          "text",
          true,
          categories.slice(1),
        )}
        {field("product", "Product of interest", "text", false)}
        {field("quantity", "Estimated quantity", "text", false)}
        {field("packaging", "Preferred packaging", "text", false)}
      </div>
      <label className="field">
        <span>Additional message</span>
        <textarea
          name="message"
          value={form.message}
          onChange={update}
          placeholder="Tell us a little about your requirements"
          rows="4"
        />
      </label>
      {message && <p className={`form-feedback ${status}`}>{message}</p>}
      <button className="button" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending enquiry…" : "Send business enquiry"}{" "}
        <span>↗</span>
      </button>
      <p className="form-note">
        Your details will only be used to respond to this business enquiry.
      </p>
    </form>
  );
}

function ProductCard({ item, onOpen }) {
  return (
    <article className="product-card">
      <button
        className="product-image"
        onClick={() => onOpen(item)}
        aria-label={`View ${item.name} details`}
      >
        {image(item.image, item.name)}
        <span className="product-tag">{item.tag}</span>
      </button>
      <div className="product-info">
        <div>
          <span className="eyebrow">{item.category}</span>
          <h3>{item.name}</h3>
        </div>
        <button
          className="circle-arrow"
          onClick={() => onOpen(item)}
          aria-label={`Enquire about ${item.name}`}
        >
          ↗
        </button>
      </div>
      <p className="product-id">ILLUSTRATIVE ITEM · {item.id}</p>
    </article>
  );
}

function ProductDialog({ item, close, enquire }) {
  if (!item) return null;
  return (
    <div className="dialog-backdrop" role="presentation" onClick={close}>
      <section
        className="product-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="dialog-close"
          onClick={close}
          aria-label="Close product details"
        >
          ×
        </button>
        {image(item.image, item.name)}
        <div className="dialog-copy">
          <span className="eyebrow">
            {item.category} · {item.id}
          </span>
          <h2 id="dialog-title">{item.name}</h2>
          <p>{item.description}</p>
          <div className="detail-note">
            <b>Packaging & availability</b>
            <p>{packagingNote}</p>
          </div>
          <button className="button" onClick={() => enquire(item.name)}>
            Enquire about this product <span>↗</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [filter, setFilter] = useState("All products");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [formProduct, setFormProduct] = useState("");
  const filtered = useMemo(
    () =>
      products.filter(
        (item) =>
          (filter === "All products" ||
            item.category.toLowerCase() === filter.toLowerCase()) &&
          `${item.name} ${item.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [filter, query],
  );
  const selectForEnquiry = (name) => {
    setFormProduct(name);
    setSelected(null);
    document.querySelector("#enquire")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <Header />
      <main>
        <section className="hero" id="home">
          <div className="hero-photo">
            {image(
              "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=1900&q=90",
              "Assorted dried pulses and legumes",
            )}
          </div>
          <div className="hero-overlay" />
          <div className="hero-content">
            <span className="eyebrow eyebrow-light">
              A trading partner for your business
            </span>
            <h1>
              Quality pulses
              <br />& spices.
              <br />
              <em>Built for global trade.</em>
            </h1>
            <p>
              Connecting businesses with the ingredients behind everyday food.
              Tell us what your market needs.
            </p>
            <div className="hero-actions">
              <a href="#products" className="button button-cream">
                Explore products <span>↘</span>
              </a>
              <a href="#enquire" className="text-link text-link-light">
                Start a business enquiry <span>↗</span>
              </a>
            </div>
            <div className="hero-caption">
              <span className="caption-line" /> INDKAN WORLD WIDE EXIM LLC{" "}
              <span>PRODUCT RANGE SHOWN FOR ILLUSTRATION</span>
            </div>
          </div>
          <div className="hero-side-label">
            PULSES&nbsp; · &nbsp;LENTILS&nbsp; · &nbsp;SPICES
          </div>
        </section>

        <section className="intro section-wrap">
          <div className="section-kicker">01 / WHAT WE DO</div>
          <div className="intro-copy">
            <h2>
              Every good partnership
              <br />
              <em>starts with a conversation.</em>
            </h2>
            <p>
              INDKAN World Wide Exim LLC is presented here as a business enquiry
              destination for buyers exploring pulses, lentils and spices. Share
              your requirements and start a conversation with the team.
            </p>
            <a href="#about" className="text-link">
              Get to know us <span>↗</span>
            </a>
          </div>
        </section>

        <section id="products" className="products-section section-wrap">
          <div className="section-heading">
            <div>
              <span className="section-kicker">02 / EXPLORE OUR RANGE</span>
              <h2>
                Ingredients for
                <br />
                <em>everyday essentials.</em>
              </h2>
            </div>
            <p>
              Browse our illustrative catalogue and send an enquiry to confirm
              current availability, specifications and terms.
            </p>
          </div>
          <div className="catalog-tools">
            <div
              className="filter-list"
              role="tablist"
              aria-label="Filter products by category"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  className={
                    filter === category
                      ? "filter-button active"
                      : "filter-button"
                  }
                  onClick={() => setFilter(category)}
                  role="tab"
                  aria-selected={filter === category}
                >
                  {category}
                </button>
              ))}
            </div>
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label="Search products"
                placeholder="Search the range"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>
          <div className="product-grid">
            {filtered.map((item) => (
              <ProductCard key={item.id} item={item} onOpen={setSelected} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="empty-state">
              <span>⌕</span>
              <h3>No products found</h3>
              <p>Try another search term or browse all products.</p>
              <button
                className="text-link"
                onClick={() => {
                  setFilter("All products");
                  setQuery("");
                }}
              >
                Clear filters ↗
              </button>
            </div>
          )}
          <p className="catalog-footnote">
            Catalogue items and imagery are illustrative pending company
            confirmation.
          </p>
        </section>

        <section className="statement-band">
          <div className="statement-image">
            {image(
              "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85",
              "Colourful spices in bowls",
            )}
          </div>
          <div className="statement-copy">
            <span className="section-kicker">A CLEAR START FOR BUYERS</span>
            <h2>
              Your market.
              <br />
              Your requirements.
              <br />
              <em>Let's talk supply.</em>
            </h2>
            <p>
              Product details, sourcing, packaging and supply terms should be
              confirmed directly with INDKAN before an order is placed.
            </p>
            <a href="#enquire" className="button button-cream">
              Discuss your requirements <span>↗</span>
            </a>
          </div>
        </section>

        <section id="about" className="about-section section-wrap">
          <div className="about-photo">
            {image(
              "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1100&q=85",
              "Ingredients prepared for a food business",
            )}
          </div>
          <div className="about-copy">
            <span className="section-kicker">03 / ABOUT INDKAN</span>
            <h2>
              Trade begins
              <br />
              with <em>trust.</em>
            </h2>
            <p>
              INDKAN World Wide Exim LLC focuses on pulses and spices, according
              to the assignment brief. This prototype gives wholesale buyers,
              distributors, retailers and other businesses a clear place to
              explore product categories and make contact.
            </p>
            <p>
              We have not been able to verify additional company history,
              certifications, destinations or operating capabilities from the
              supplied references. Please confirm those details with the company
              before publishing.
            </p>
            <a
              className="text-link"
              href="https://indkanworldwideexim.in/index.html"
              target="_blank"
              rel="noreferrer"
            >
              Visit official website <span>↗</span>
            </a>
          </div>
        </section>

        <section id="supply" className="supply-section">
          <div className="section-wrap supply-inner">
            <div>
              <span className="section-kicker">04 / PACKAGING & SUPPLY</span>
              <h2>
                Tell us what
                <br />
                <em>works for you.</em>
              </h2>
              <p>
                Packaging formats, order quantities, labelling and supply
                options are confirmed per enquiry. Share your preferred format
                and the team can discuss what is available.
              </p>
              <a href="#enquire" className="text-link">
                Ask about packaging <span>↗</span>
              </a>
            </div>
            <div className="supply-list">
              <div>
                <span>01</span>
                <h3>Product requirements</h3>
                <p>Category, product and any specification you need.</p>
                <b>TO BE CONFIRMED</b>
              </div>
              <div>
                <span>02</span>
                <h3>Packaging preferences</h3>
                <p>Tell us about your preferred packaging and labelling.</p>
                <b>TO BE CONFIRMED</b>
              </div>
              <div>
                <span>03</span>
                <h3>Supply discussion</h3>
                <p>Discuss estimated quantity, destination and timing.</p>
                <b>SUBJECT TO AVAILABILITY</b>
              </div>
            </div>
          </div>
        </section>

        <section id="enquire" className="enquiry-section section-wrap">
          <div className="enquiry-aside">
            <span className="section-kicker">05 / BUSINESS ENQUIRIES</span>
            <h2>
              Let’s make
              <br />
              <em>an introduction.</em>
            </h2>
            <p>
              For wholesale, distribution, retail, bulk buying and trade
              enquiries, send us a note. Our team can follow up to learn more.
            </p>
            <div className="contact-card">
              <span>Prefer to connect directly?</span>
              <a
                href="https://indkanworldwideexim.in/index.html"
                target="_blank"
                rel="noreferrer"
              >
                Visit the official company website ↗
              </a>
              <small>
                Contact details are not independently verified in this
                prototype.
              </small>
            </div>
          </div>
          <div className="form-panel">
            <div className="form-heading">
              <span>BUSINESS ENQUIRY</span>
              <p>
                Fields marked <i>*</i> are required
              </p>
            </div>
            <EnquiryForm key={formProduct} selectedProduct={formProduct} />
          </div>
        </section>

        <section id="contact" className="contact-strip">
          <div>
            <span className="section-kicker">
              READY TO START A CONVERSATION?
            </span>
            <h2>Let’s talk business.</h2>
          </div>
          <a href="#enquire" className="button button-cream">
            Make an enquiry <span>↗</span>
          </a>
        </section>
      </main>
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Brand light />
            <p>
              Pulses, lentils & spices
              <br />
              for business conversations.
            </p>
          </div>
          <div className="footer-links">
            <span>EXPLORE</span>
            <a href="#about">About us</a>
            <a href="#products">Products</a>
            <a href="#supply">Packaging & supply</a>
            <a href="#enquire">Business enquiries</a>
          </div>
          <div className="footer-links">
            <span>CONNECT</span>
            <a
              href="https://indkanworldwideexim.in/index.html"
              target="_blank"
              rel="noreferrer"
            >
              Official website ↗
            </a>
            <a
              href="https://www.youtube.com/@indkanworldwideeximkolkata"
              target="_blank"
              rel="noreferrer"
            >
              YouTube ↗
            </a>
            <a
              href="https://www.instagram.com/indkankolkata?rpxt=OXk0eDMzaG1ybzA="
              target="_blank"
              rel="noreferrer"
            >
              Instagram ↗
            </a>
          </div>
          <div className="footer-note">
            Company contact details and further business information should be
            added after verification.
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} INDKAN World Wide Exim LLC</span>
          <span>Catalogue content shown for demonstration</span>
          <a href="#home">Back to top ↑</a>
        </div>
      </footer>
      <ProductDialog
        item={selected}
        close={() => setSelected(null)}
        enquire={selectForEnquiry}
      />
    </>
  );
}

export default App;
