import React, { useState } from 'react';
import "../styles/Help.css";

const Help = () => {
  // FAQ toggle korar jonno chotto ekta state logic
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    { q: "How do I place an order?", a: "Go to the homepage, add medicines to your cart, and click checkout from the cart page." },
    { q: "Can I remove items from my cart?", a: "Yes, you can remove any item directly from the Cart page before placing the order." },
    { q: "Can I change medicine quantity?", a: "Absolutely. In the Cart page, you can increase or decrease the quantity of each medicine." },
    { q: "How does delivery work?", a: "You can choose between Home Delivery or Pharmacy Pickup. For home delivery, a rider will be assigned." },
    { q: "What if a medicine is unavailable?", a: "If a medicine is out of stock, it will show as 'Unavailable' on the homepage." }
  ];

  return (
    <div className="help-root">
      <div className="help-hero">
        <div className="hero-pill">Support Center</div>
        <h1 className="help-title">How can we <span>help?</span></h1>
      </div>

      <div className="help-container">
        {/* Instructions Section */}
        <div className="help-grid">
          <div className="card">
            <h3 className="section-heading">🛒 How to Add Medicines</h3>
            <div className="how-steps">
              <div className="how-step">
                <span className="step-num">01</span>
                <p>Browse medicines on the homepage.</p>
              </div>
              <div className="how-step">
                <span className="step-num">02</span>
                <p>Click the "Add to Cart" button under a medicine.</p>
              </div>
              <div className="how-step">
                <span className="step-num">03</span>
                <p>The item will appear in your cart instantly.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-heading">📦 How to Place an Order</h3>
            <div className="how-steps">
              <div className="how-step"><span className="step-num">01</span><p>Go to the Cart page.</p></div>
              <div className="how-step"><span className="step-num">02</span><p>Review your selected medicines & quantities.</p></div>
              <div className="how-step"><span className="step-num">03</span><p>Click Checkout and choose delivery type.</p></div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2 className="section-heading centered">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item card ${activeIndex === index ? 'active' : ''}`}
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              >
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <span className="faq-arrow">{activeIndex === index ? '−' : '+'}</span>
                </div>
                {activeIndex === index && <p className="faq-answer">{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Support Card */}
        <div className="contact-card card">
          <h3>Still need help?</h3>
          <p>If you experience any issues, please contact our support team:</p>
          <a href="mailto:caremeds65@gmail.com" className="contact-link">caremeds65@gmail.com</a>
        </div>
      </div>
    </div>
  );
};

export default Help;