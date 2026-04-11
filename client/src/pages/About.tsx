import "../styles/About.css";

const About = () => {
  const teamMembers = [
    { name: "MD. Mushfiqur Rahman", email: "mushfiqur.cse.20230104099@aust.edu" },
    { name: "MD. Mahedi Hasan Oni", email: "mahedi.cse.20230104098@aust.edu" },
    { name: "Maimuna Momtaj Emu", email: "maimuna.cse.20230104078@aust.edu" },
    { name: "Sabikun Alam", email: "sabikun.cse.20230104095@aust.edu" },
  ];

  return (
    <div className="about-root">
      {/* Header Section */}
      <div className="about-hero">
        <div className="hero-pill">Project Overview</div>
        <h1 className="about-title">Care<span>Meds</span></h1>
        <p className="about-subtitle">Medicine Availability System</p>
      </div>

      <div className="about-container">
        {/* Description Section */}
        <section className="about-section card">
          <h2 className="section-heading">Our Mission</h2>
          <p className="section-text">
            CareMeds is a web-based platform designed to make it easier for customers to find and order 
            medicines from nearby pharmacies. Users can browse available medicines, add them to a cart, 
            and choose either home delivery or pharmacy pickup depending on their needs.
          </p>
          <p className="section-text">
            By providing a centralized platform, CareMeds ensures users can quickly check 
            availability and place orders conveniently, reducing the difficulty of physically 
            searching for medicines across multiple pharmacies.
          </p>
        </section>

        {/* Features Section - Centered and Wider */}
        <div className="about-grid-centered">
          <div className="card features-card">
            <h3 className="section-heading centered">Key Features</h3>
            <ul className="feature-list-wide">
              <li>Browse & Search medicines</li>
              <li>Add medicines to cart</li>
              <li>Place orders easily</li>
              <li>Home delivery & Pickup options</li>
              <li>Rider delivery assignment</li>
              <li>Pharmacy Inventory Management</li>
            </ul>
          </div>
        </div>

        {/* Team Section */}
        <section className="about-section">
          <h2 className="section-heading centered">Meet Our Team</h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div className="team-card card" key={index}>
                <div className="member-icon">👤</div>
                <h4 className="member-name">{member.name}</h4>
                <p className="member-email">{member.email}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-card card">
          <h3>Contact Our Team</h3>
          <p>For any questions or feedback regarding the system, please contact:</p>
          <a href="mailto:caremeds65@gmail.com" className="contact-link">caremeds65@gmail.com</a>
        </section>
      </div>
    </div>
  );
};

export default About;