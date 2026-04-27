import { Link } from "react-router-dom";
import EuropeMap from "../components/EuropeMap";
// import FlagIcon from "../components/FlagIcon";
import RankingsSection from "../components/RankingsSection";

const selectedCountries = [
  "Czech Republic",
  "Hungary",
  "Germany",
  "Italy",
  "France",
  "Netherlands",
  "Bulgaria",
  "Croatia",
  "Sweden",
  "Spain",
  "Lithuania",
  "Estonia",
];

const dashboardFeatures = [
  {
    title: "Single-country analysis",
    text: "Inspect how housing prices moved together with mortgage rates, income, and unemployment over time.",
  },
  {
    title: "Country comparison",
    text: "Compare two countries side by side and evaluate affordability-related indicators directly.",
  },
  {
    title: "Interactive map",
    text: "Use the Europe map to inspect supported countries and open the latest available country details.",
  },
  {
    title: "Mortgage simulation",
    text: "Estimate monthly payments and compare them with income as a simplified housing burden indicator.",
  },
];

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero-section full-width-section">
        <div className="hero-layout">
          <div className="hero-main">
            <div className="section-badge">Bachelor Thesis Dashboard</div>
            <h2 className="hero-title">Explore housing affordability across Europe</h2>
            <p className="hero-text">
              This web application combines housing prices, mortgage rates,
              disposable income, unemployment, country comparison, and mortgage
              simulation tools in a single analytical environment. It is designed
              to support comparative analysis of affordability patterns across
              selected European countries.
            </p>

            <div className="hero-actions">
              <Link to="/comparison" className="hero-cta primary">
                Compare Countries
              </Link>
              <Link to="/simulator" className="hero-cta secondary">
                Open Mortgage Simulator
              </Link>
            </div>
          </div>

          <aside className="hero-aside">
            <h3>Dashboard Scope</h3>
            <ul>
              <li>Country-level trend analysis</li>
              <li>Interactive Europe map</li>
              <li>Two-country comparison mode</li>
              <li>Mortgage affordability simulation</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="full-width-section intro-grid">
        <div className="text-section">
          <h3>About the project</h3>
          <p>
            The application supports the analysis of housing affordability using
            four main indicators: Housing Price Index, mortgage rates,
            disposable income, and unemployment. Together, these variables help
            explain how access to housing changes across countries and over time.
          </p>
        </div>

        <div className="text-section">
          <h3>How to use the dashboard</h3>
          <ul className="clean-list">
            <li>Choose a country and time period</li>
            <li>Explore indicator relationships</li>
            <li>Compare two countries directly</li>
            <li>Use the mortgage simulator for practical estimates</li>
          </ul>
        </div>
      </section>

      <section className="full-width-section">
        <div className="section-badge">Main Features</div>
        <h3 className="section-title">Analytical tools included in the application</h3>
        <div className="feature-overview-grid">
          {dashboardFeatures.map((feature) => (
            <article key={feature.title} className="feature-overview-item">
              <h4>{feature.title}</h4>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="full-width-section">
        <EuropeMap />
      </section>

      <section className="full-width-section">
        <RankingsSection />
      </section>

{/*       <section className="full-width-section dataset-coverage-section"> */}
{/*         <div className="dataset-coverage-header"> */}
{/*           <div> */}
{/*             <div className="section-badge">Dataset Coverage</div> */}
{/*             <h3 className="section-title">Countries included in the application</h3> */}
{/*             <p className="map-description"> */}
{/*               These countries are included in the dashboard dataset and are available */}
{/*               across the analytical views. */}
{/*             </p> */}
{/*           </div> */}
{/*         </div> */}

{/*         <div className="country-chip-grid dataset-chip-grid"> */}
{/*           {selectedCountries.map((country) => ( */}
{/*             <div key={country} className="country-chip dataset-chip static-chip"> */}
{/*               <FlagIcon country={country} className="flag-icon" /> */}
{/*               <span>{country}</span> */}
{/*             </div> */}
{/*           ))} */}
{/*         </div> */}
{/*       </section> */}

      <section className="full-width-section">
        <div className="section-badge">Explore the Dashboard</div>
        <h3 className="section-title">Main analytical views</h3>

        <div className="feature-card-grid">
          <Link to="/indicators" className="feature-card clean-feature-card">
            <h4>Indicator Analysis</h4>
            <p>
              Select HPI, mortgage rates, income, and unemployment in one combined
              chart. Compare one, several, or all indicators for a chosen country and
              period.
            </p>
          </Link>

          <Link to="/comparison" className="feature-card clean-feature-card">
            <h4>Compare Countries</h4>
            <p>
              Compare two countries directly across selected affordability-related
              indicators and inspect differences in national housing market trends.
            </p>
          </Link>

          <Link to="/simulator" className="feature-card clean-feature-card">
            <h4>Mortgage Simulator</h4>
            <p>
              Estimate monthly mortgage payments and assess affordability pressure
              based on loan size, interest rate, repayment term, and income.
            </p>
          </Link>

          <Link to="/methodology" className="feature-card clean-feature-card">
            <h4>Methodology</h4>
            <p>
              Review the data sources, selected indicators, processing approach,
              limitations, and analytical assumptions behind the dashboard.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}