import { useEffect, useMemo, useState } from "react";

const currencyOptions = [
  { code: "USD", label: "US Dollar", symbol: "$", region: "United States", rateToEur: 0.92 },
  { code: "GBP", label: "British Pound", symbol: "£", region: "United Kingdom", rateToEur: 1.17 },
  { code: "CHF", label: "Swiss Franc", symbol: "CHF", region: "Switzerland", rateToEur: 1.04 },
  { code: "CZK", label: "Czech Koruna", symbol: "Kč", region: "Czechia", rateToEur: 0.04 },
  { code: "PLN", label: "Polish Zloty", symbol: "zł", region: "Poland", rateToEur: 0.23 },
  { code: "HUF", label: "Hungarian Forint", symbol: "Ft", region: "Hungary", rateToEur: 0.0025 },
  { code: "SEK", label: "Swedish Krona", symbol: "kr", region: "Sweden", rateToEur: 0.087 },
  { code: "NOK", label: "Norwegian Krone", symbol: "kr", region: "Norway", rateToEur: 0.086 },
  { code: "DKK", label: "Danish Krone", symbol: "kr", region: "Denmark", rateToEur: 0.134 },
  { code: "TRY", label: "Turkish Lira", symbol: "₺", region: "Türkiye", rateToEur: 0.028 },
];

function calculateMonthlyPayment(principal, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;

  if (!principal || !years) return 0;

  if (monthlyRate === 0) return principal / numberOfPayments;

  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
}

function cleanMoneyInput(value) {
  if (value === "") return "";

  let cleaned = value.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");

  if (parts.length > 2) cleaned = `${parts[0]}.${parts.slice(1).join("")}`;

  const [integerPart, decimalPart] = cleaned.split(".");
  if (decimalPart !== undefined) return `${integerPart}.${decimalPart.slice(0, 2)}`;

  return integerPart;
}

function cleanYearInput(value) {
  if (value === "") return "";
  return value.replace(/[^0-9]/g, "");
}

function getEligibilityAssessment({ ltv, dsti, lti, years, stressDsti }) {
  const checks = [
    {
      label: "Loan-to-value ratio",
      value: ltv,
      limit: 90,
      unit: "%",
      passed: ltv <= 90,
      description: "Measures loan amount relative to property value.",
    },
    {
      label: "Debt-service-to-income ratio",
      value: dsti,
      limit: 35,
      unit: "%",
      passed: dsti <= 35,
      description: "Measures monthly mortgage payment relative to income.",
    },
    {
      label: "Loan-to-income ratio",
      value: lti,
      limit: 4.5,
      unit: "x",
      passed: lti <= 4.5,
      description: "Measures loan amount relative to annual income.",
    },
    {
      label: "Stress-tested DSTI",
      value: stressDsti,
      limit: 40,
      unit: "%",
      passed: stressDsti <= 40,
      description: "Tests repayment ability under a higher interest rate.",
    },
    {
      label: "Loan maturity",
      value: years,
      limit: 30,
      unit: " years",
      passed: years <= 30,
      description: "Checks whether the repayment term stays within a conservative maturity range.",
    },
  ];

  const failed = checks.filter((check) => !check.passed).length;

  if (failed === 0) {
    return {
      label: "Eligible profile",
      className: "status-good",
      text: "The simulated borrower profile fits the selected conservative lending thresholds.",
      checks,
    };
  }

  if (failed <= 2) {
    return {
      label: "Borderline profile",
      className: "status-medium",
      text: "The profile may require stronger income, a higher down payment, or a shorter loan term.",
      checks,
    };
  }

  return {
    label: "High-risk profile",
    className: "status-high",
    text: "The profile exceeds several lending thresholds and would likely need adjustment before approval.",
    checks,
  };
}

export default function MortgageSimulatorPage() {
  const [propertyPrice, setPropertyPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  const [converterOpen, setConverterOpen] = useState(false);
  const [converterAmount, setConverterAmount] = useState("");
  const [converterCurrency, setConverterCurrency] = useState("USD");

  useEffect(() => {
    if (!converterOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setConverterOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [converterOpen]);

  const selectedCurrency = currencyOptions.find((item) => item.code === converterCurrency);

  const convertedAmount = useMemo(() => {
    const amount = Number(converterAmount) || 0;
    return amount * (selectedCurrency?.rateToEur || 0);
  }, [converterAmount, selectedCurrency]);

  const numericPropertyPrice = Number(propertyPrice) || 0;
  const numericDownPayment = Number(downPayment) || 0;
  const numericInterestRate = Number(interestRate) || 0;
  const numericLoanTerm = Number(loanTerm) || 0;
  const numericMonthlyIncome = Number(monthlyIncome) || 0;

  const loanAmount = Math.max(numericPropertyPrice - numericDownPayment, 0);

  const monthlyPayment = useMemo(() => {
    return calculateMonthlyPayment(loanAmount, numericInterestRate, numericLoanTerm);
  }, [loanAmount, numericInterestRate, numericLoanTerm]);

  const stressPayment = useMemo(() => {
    return calculateMonthlyPayment(loanAmount, numericInterestRate + 2, numericLoanTerm);
  }, [loanAmount, numericInterestRate, numericLoanTerm]);

  const ltv = numericPropertyPrice > 0 ? (loanAmount / numericPropertyPrice) * 100 : 0;
  const dsti = numericMonthlyIncome > 0 ? (monthlyPayment / numericMonthlyIncome) * 100 : 0;
  const stressDsti = numericMonthlyIncome > 0 ? (stressPayment / numericMonthlyIncome) * 100 : 0;
  const annualIncome = numericMonthlyIncome * 12;
  const lti = annualIncome > 0 ? loanAmount / annualIncome : 0;

  const totalRepayment = monthlyPayment * numericLoanTerm * 12;
  const totalInterest = totalRepayment - loanAmount;

  const assessment = getEligibilityAssessment({
    ltv,
    dsti,
    lti,
    years: numericLoanTerm,
    stressDsti,
  });

  const formatCurrency = (value) =>
    `${Number(value).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} EUR`;

  const formatNumber = (value, unit = "") =>
    `${Number(value).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}${unit}`;

  const moneyInputProps = {
    type: "text",
    inputMode: "decimal",
    className: "filter-select simulator-input",
    onKeyDown: (e) => {
      if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
        e.preventDefault();
      }
    },
  };

  const applyConvertedToPropertyPrice = () => {
    setPropertyPrice(convertedAmount.toFixed(2));
    setConverterOpen(false);
  };

  const applyConvertedToDownPayment = () => {
    setDownPayment(convertedAmount.toFixed(2));
    setConverterOpen(false);
  };

  const applyConvertedToIncome = () => {
    setMonthlyIncome(convertedAmount.toFixed(2));
    setConverterOpen(false);
  };

  return (
    <div className="analysis-page">
      <div className="page-header comparison-header">
        <div className="section-badge">Simulation View</div>
        <h2>Mortgage Eligibility Simulator</h2>
        <p className="page-description">
          Estimate whether a simulated borrower profile would fit conservative
          bank-style lending thresholds based on LTV, DSTI, LTI, maturity, and
          a stress-tested interest rate scenario.
        </p>
      </div>

      <div className="simulator-toolbar">
        <button
          type="button"
          className="currency-converter-button"
          onClick={() => setConverterOpen(true)}
        >
          Different currency? No problem
        </button>
      </div>

      <div className="simulator-pro-layout">
        <div className="simulator-form-card">
          <div className="simulator-card-header">
            <h3>Borrower and Loan Inputs</h3>
            <p>
              Enter the main variables used in a simplified mortgage
              creditworthiness assessment.
            </p>
          </div>

          <div className="simulator-grid-pro">
            <div className="simulator-field">
              <label className="filter-label">Property price (EUR)</label>
              <input
                {...moneyInputProps}
                value={propertyPrice}
                placeholder="0.00"
                onChange={(e) => setPropertyPrice(cleanMoneyInput(e.target.value))}
              />
            </div>

            <div className="simulator-field">
              <label className="filter-label">Down payment (EUR)</label>
              <input
                {...moneyInputProps}
                value={downPayment}
                placeholder="0.00"
                onChange={(e) => setDownPayment(cleanMoneyInput(e.target.value))}
              />
            </div>

            <div className="simulator-field">
              <label className="filter-label">Interest rate (%)</label>
              <input
                {...moneyInputProps}
                value={interestRate}
                placeholder="0.00"
                onChange={(e) => setInterestRate(cleanMoneyInput(e.target.value))}
              />
            </div>

            <div className="simulator-field">
              <label className="filter-label">Loan term (years)</label>
              <input
                type="text"
                inputMode="numeric"
                className="filter-select simulator-input"
                value={loanTerm}
                placeholder="0"
                onKeyDown={(e) => {
                  if (["-", ".", ",", "e", "E", "+"].includes(e.key)) e.preventDefault();
                }}
                onChange={(e) => setLoanTerm(cleanYearInput(e.target.value))}
              />
            </div>

            <div className="simulator-field">
              <label className="filter-label">Monthly net income (EUR)</label>
              <input
                {...moneyInputProps}
                value={monthlyIncome}
                placeholder="0.00"
                onChange={(e) => setMonthlyIncome(cleanMoneyInput(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="simulator-results-card">
          <div className="simulator-card-header">
            <h3>Bank-style Assessment</h3>
            <p>
              The output uses conservative lending ratios commonly used in
              mortgage creditworthiness assessment.
            </p>
          </div>

          <div className={`simulator-status-banner ${assessment.className}`}>
            <h4>{assessment.label}</h4>
            <p>{assessment.text}</p>
          </div>

          <div className="eligibility-check-list">
            {assessment.checks.map((check) => (
              <div
                key={check.label}
                className={`eligibility-check ${check.passed ? "passed" : "failed"}`}
              >
                <div>
                  <strong>{check.label}</strong>
                  <p>{check.description}</p>
                </div>

                <div className="eligibility-value">
                  <span>{formatNumber(check.value, check.unit)}</span>
                  <small>Limit: {check.limit}{check.unit}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="simulator-results-list">
            <div className="simulator-result-row">
              <span>Loan Amount</span>
              <strong>{formatCurrency(loanAmount)}</strong>
            </div>

            <div className="simulator-result-row">
              <span>Estimated Monthly Payment</span>
              <strong>{formatCurrency(monthlyPayment)}</strong>
            </div>

            <div className="simulator-result-row">
              <span>Stress-tested Payment (+2 p.p.)</span>
              <strong>{formatCurrency(stressPayment)}</strong>
            </div>

            <div className="simulator-result-row">
              <span>Total Interest Paid</span>
              <strong>{formatCurrency(totalInterest)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="insight-box">
        <h3>Interpretation note</h3>
        <p>
          This tool is an educational approximation of a mortgage
          creditworthiness assessment. Real lending decisions depend on national
          regulation, bank policy, borrower history, collateral valuation, and
          additional risk checks.
        </p>
      </div>

      {converterOpen && (
        <div className="currency-modal-overlay" onClick={() => setConverterOpen(false)}>
          <div className="currency-modal" onClick={(event) => event.stopPropagation()}>
            <div className="currency-modal-topline">
              <div>
                <div className="section-badge">Currency Helper</div>
                <h3>Convert to EUR</h3>
                <p>Convert common currencies to EUR. Press ESC to close.</p>
              </div>

              <button
                type="button"
                className="tutorial-close-button"
                onClick={() => setConverterOpen(false)}
                aria-label="Close currency converter"
              >
                ×
              </button>
            </div>

            <div className="currency-converter-grid">
              <div>
                <label className="filter-label">Amount</label>
                <input
                  {...moneyInputProps}
                  value={converterAmount}
                  placeholder="0.00"
                  onChange={(e) => setConverterAmount(cleanMoneyInput(e.target.value))}
                />
              </div>

              <div>
                <label className="filter-label">Currency</label>
                <div className="currency-select-wrapper">
                  <select
                    className="filter-select currency-select"
                    value={converterCurrency}
                    onChange={(e) => setConverterCurrency(e.target.value)}
                  >
                    {currencyOptions.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} — {currency.label}
                      </option>
                    ))}
                  </select>

                  {selectedCurrency && (
                    <div className="selected-currency-preview">
                      <div className="selected-currency-symbol">
                        {selectedCurrency.symbol}
                      </div>
                      <div>
                        <strong>{selectedCurrency.code}</strong>
                        <span>
                          {selectedCurrency.label} · {selectedCurrency.region}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="currency-result-card">
              <span>Estimated EUR value</span>
              <strong>{formatCurrency(convertedAmount)}</strong>
            </div>

            <div className="currency-apply-grid">
              <button type="button" className="tutorial-button secondary" onClick={applyConvertedToPropertyPrice}>
                Apply to property price
              </button>
              <button type="button" className="tutorial-button secondary" onClick={applyConvertedToDownPayment}>
                Apply to down payment
              </button>
              <button type="button" className="tutorial-button primary" onClick={applyConvertedToIncome}>
                Apply to monthly income
              </button>
            </div>

            <p className="currency-disclaimer">
              Exchange rates are static reference values for dashboard simulation only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}