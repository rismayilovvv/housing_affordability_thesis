import { Link } from "react-router-dom";

export default function MethodologyPage() {
  return (
    <div className="analysis-page methodology-page">
      <section className="full-width-section">
        <div className="page-header">
          <div className="section-badge">Research Methodology</div>
          <h2>Methodology and Data Notes</h2>
          <p className="page-description">
            This page explains the logic, indicators, data preparation approach,
            and limitations behind the Housing Affordability Dashboard.
          </p>
        </div>

        <div className="methodology-grid">
          <article className="methodology-card">
            <h3>Purpose of the application</h3>
            <p>
              The dashboard was developed to support comparative analysis of
              housing affordability across selected European countries. It
              combines housing prices, mortgage rates, disposable income, and
              unemployment into a single interactive analytical environment.
            </p>
          </article>

          <article className="methodology-card">
            <h3>Selected indicators</h3>
            <ul>
              <li><strong>Housing Price Index:</strong> tracks housing price changes over time.</li>
              <li><strong>Mortgage rate:</strong> represents borrowing cost pressure.</li>
              <li><strong>Income:</strong> reflects household purchasing capacity.</li>
              <li><strong>Unemployment:</strong> captures labour market conditions.</li>
            </ul>
          </article>

          <article className="methodology-card">
            <h3>Data processing</h3>
            <p>
              Source datasets were cleaned, filtered by country and year, and
              converted into a consistent structure used by the backend API.
              Where necessary, monetary values were converted into EUR to improve
              comparability across countries.
            </p>
          </article>

          <article className="methodology-card">
            <h3>Analytical approach</h3>
            <p>
              The dashboard focuses on descriptive and comparative analysis.
              Users can inspect trends over time, compare countries directly,
              view country-level summaries, and simulate mortgage affordability
              under simplified assumptions.
            </p>
          </article>

          <article className="methodology-card">
            <h3>Mortgage simulator</h3>
            <p>
              The simulator applies a standard fixed-rate mortgage payment
              formula. It estimates the monthly payment based on loan amount,
              interest rate, and repayment period, then compares the payment
              with monthly income.
            </p>
          </article>

          <article className="methodology-card">
            <h3>Limitations</h3>
            <p>
              The dashboard is intended for analytical and educational use. It
              does not include taxes, insurance, household composition, regional
              variation, lending restrictions, or full mortgage eligibility
              rules. Therefore, outputs should be interpreted as simplified
              indicators rather than financial advice.
            </p>
          </article>
        </div>

        <div className="insight-box">
          <h3>Use in the thesis</h3>
          <p>
            This methodology supports the implementation and evaluation chapters
            by explaining how the application transforms raw data into
            interactive visual analysis.
          </p>
        </div>

        <div className="methodology-actions">
          <Link
            to="/"
            className="hero-cta primary"
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}