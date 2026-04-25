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
  { code: "RUB", label: "Russian Ruble", symbol: "₽", region: "Russia", rateToEur: 0.01 },
];

function calculateMonthlyPayment(principal, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;

  if (!principal || !years) return 0;

  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }

  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
}

function getAffordabilityStatus(paymentRatio) {
  if (paymentRatio <= 0.25) {
    return {
      label: "Comfortable",
      className: "status-good",
      text: "The estimated payment stays within a relatively comfortable share of monthly income.",
    };
  }

  if (paymentRatio <= 0.35) {
    return {
      label: "Moderate burden",
      className: "status-medium",
      text: "The estimated payment takes a noticeable share of income and may reduce affordability.",
    };
  }

  return {
    label: "High burden",
    className: "status-high",
    text: "The estimated payment takes a large share of income and may indicate affordability pressure.",
  };
}

function cleanMoneyInput(value) {
  if (value === "") return "";

  let cleaned = value.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");

  if (parts.length > 2) {
    cleaned = `${parts[0]}.${parts.slice(1).join("")}`;
  }

  const [integerPart, decimalPart] = cleaned.split(".");

  if (decimalPart !== undefined) {
    return `${integerPart}.${decimalPart.slice(0, 2)}`;
  }

  return integerPart;
}

function cleanRateInput(value) {
  return cleanMoneyInput(value);
}

function cleanYearInput(value) {
  if (value === "") return "";
  return value.replace(/[^0-9]/g, "");
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

  const selectedCurrency = currencyOptions.find(
    (item) => item.code === converterCurrency
  );

  useEffect(() => {
    if (!converterOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setConverterOpen(false);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [converterOpen]);

  const convertedAmount = useMemo(() => {
    const amount = Number(converterAmount) || 0;
    return amount * (selectedCurrency?.rateToEur || 0);
  }, [converterAmount, selectedCurrency]);

  const numericPropertyPrice = Number(propertyPrice) || 0;
  const numericDownPayment = Number(downPayment) || 0;
  const numericInterestRate = Number(interestRate) || 0;
  const numericLoanTerm = Number(loanTerm) || 0;
  const numericMonthlyIncome = Number(monthlyIncome) || 0;

  const loanAmount = useMemo(() => {
    const amount = numericPropertyPrice - numericDownPayment;
    return amount > 0 ? amount : 0;
  }, [numericPropertyPrice, numericDownPayment]);

  const monthlyPayment = useMemo(() => {
    return calculateMonthlyPayment(
      loanAmount,
      numericInterestRate,
      numericLoanTerm
    );
  }, [loanAmount, numericInterestRate, numericLoanTerm]);

  const paymentRatio = useMemo(() => {
    if (!numericMonthlyIncome || numericMonthlyIncome <= 0) return 0;
    return monthlyPayment / numericMonthlyIncome;
  }, [monthlyPayment, numericMonthlyIncome]);

  const totalRepayment = useMemo(() => {
    return monthlyPayment * numericLoanTerm * 12;
  }, [monthlyPayment, numericLoanTerm]);

  const totalInterest = useMemo(() => {
    return totalRepayment - loanAmount;
  }, [totalRepayment, loanAmount]);

  const status = getAffordabilityStatus(paymentRatio);

  const formatCurrency = (value) =>
    `${Number(value).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} EUR`;

  const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;

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
        <h2>Mortgage Payment Simulator</h2>
        <p className="page-description">
          Estimate a monthly mortgage payment using loan size, interest rate,
          repayment term, and income. This tool provides a simplified analytical
          view of affordability pressure rather than a full financial assessment.
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
            <h3>Input Parameters</h3>
            <p>
              Adjust the values below to simulate a different mortgage scenario.
              Monetary inputs are entered in EUR.
            </p>
          </div>

          <div className="simulator-grid-pro">
            <div className="simulator-field">
              <label className="filter-label" htmlFor="property-price">
                Property price (EUR)
              </label>
              <input
                {...moneyInputProps}
                id="property-price"
                value={propertyPrice}
                placeholder="0.00"
                onChange={(e) => setPropertyPrice(cleanMoneyInput(e.target.value))}
              />
            </div>

            <div className="simulator-field">
              <label className="filter-label" htmlFor="down-payment">
                Down payment (EUR)
              </label>
              <input
                {...moneyInputProps}
                id="down-payment"
                value={downPayment}
                placeholder="0.00"
                onChange={(e) => setDownPayment(cleanMoneyInput(e.target.value))}
              />
            </div>

            <div className="simulator-field">
              <label className="filter-label" htmlFor="interest-rate">
                Interest rate (%)
              </label>
              <input
                {...moneyInputProps}
                id="interest-rate"
                value={interestRate}
                placeholder="0.00"
                onChange={(e) => setInterestRate(cleanRateInput(e.target.value))}
              />
            </div>

            <div className="simulator-field">
              <label className="filter-label" htmlFor="loan-term">
                Loan term (years)
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="filter-select simulator-input"
                id="loan-term"
                value={loanTerm}
                placeholder="0"
                onKeyDown={(e) => {
                  if (
                    e.key === "-" ||
                    e.key === "." ||
                    e.key === "," ||
                    e.key === "e" ||
                    e.key === "E" ||
                    e.key === "+"
                  ) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => setLoanTerm(cleanYearInput(e.target.value))}
              />
            </div>

            <div className="simulator-field">
              <label className="filter-label" htmlFor="monthly-income">
                Monthly net income (EUR)
              </label>
              <input
                {...moneyInputProps}
                id="monthly-income"
                value={monthlyIncome}
                placeholder="0.00"
                onChange={(e) => setMonthlyIncome(cleanMoneyInput(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="simulator-results-card">
          <div className="simulator-card-header">
            <h3>Simulation Results</h3>
            <p>Key outputs based on the selected mortgage assumptions.</p>
          </div>

          <div className="simulator-results-list">
            <div className="simulator-result-row">
              <div className="simulator-result-left">
                <div className="simulator-result-icon">LN</div>
                <span>Loan Amount</span>
              </div>
              <strong>{formatCurrency(loanAmount)}</strong>
            </div>

            <div className="simulator-result-row">
              <div className="simulator-result-left">
                <div className="simulator-result-icon">MP</div>
                <span>Estimated Monthly Payment</span>
              </div>
              <strong>{formatCurrency(monthlyPayment)}</strong>
            </div>

            <div className="simulator-result-row">
              <div className="simulator-result-left">
                <div className="simulator-result-icon">PI</div>
                <span>Payment / Income Ratio</span>
              </div>
              <strong>{formatPercent(paymentRatio)}</strong>
            </div>

            <div className="simulator-result-row">
              <div className="simulator-result-left">
                <div className="simulator-result-icon">TI</div>
                <span>Total Interest Paid</span>
              </div>
              <strong>{formatCurrency(totalInterest)}</strong>
            </div>

            <div className={`simulator-status-banner ${status.className}`}>
              <h4>Affordability Assessment: {status.label}</h4>
              <p>{status.text}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="insight-box">
        <h3>How to read this simulation</h3>
        <p>
          This estimate is based on a standard fixed-rate mortgage formula. It
          does not include taxes, insurance, maintenance costs, or country-specific
          lending rules. The currency converter uses editable static reference
          rates for demonstration purposes and should not be treated as live FX
          data.
        </p>
      </div>

      {converterOpen && (
        <div
          className="currency-modal-overlay"
          onClick={() => setConverterOpen(false)}
        >
          <div
            className="currency-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="currency-modal-topline">
              <div>
                <div className="section-badge">Currency Helper</div>
                <h3>Convert to EUR</h3>
                <p>
                  Convert common currencies to <b>EUR</b> and apply the result directly
                  to simulator fields.
                  Press <b>ESC</b> to close.
                </p>
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
                <label className="filter-label" htmlFor="converter-amount">
                  Amount
                </label>
                <input
                  {...moneyInputProps}
                  id="converter-amount"
                  value={converterAmount}
                  placeholder="0.00"
                  onChange={(e) =>
                    setConverterAmount(cleanMoneyInput(e.target.value))
                  }
                />
              </div>

              <div>
                <label className="filter-label" htmlFor="converter-currency">
                  Currency
                </label>

                <div className="currency-select-wrapper">
                  <select
                    id="converter-currency"
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
              <button
                type="button"
                className="tutorial-button secondary"
                onClick={applyConvertedToPropertyPrice}
              >
                Apply to property price
              </button>
              <button
                type="button"
                className="tutorial-button secondary"
                onClick={applyConvertedToDownPayment}
              >
                Apply to down payment
              </button>
              <button
                type="button"
                className="tutorial-button primary"
                onClick={applyConvertedToIncome}
              >
                Apply to monthly income
              </button>
            </div>

            <p className="currency-disclaimer">
              Exchange rates are static reference values for dashboard simulation
              only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}