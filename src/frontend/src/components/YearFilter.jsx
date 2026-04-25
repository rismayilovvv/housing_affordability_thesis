export default function YearFilter({
  startYear,
  endYear,
  onStartYearChange,
  onEndYearChange,
  availableYears,
}) {
  const years = availableYears || [];

  const handleStartChange = (value) => {
    const nextStart = Number(value);

    if (nextStart >= endYear) {
      onStartYearChange(nextStart);
      onEndYearChange(nextStart + 1);
      return;
    }

    onStartYearChange(nextStart);
  };

  const handleEndChange = (value) => {
    const nextEnd = Number(value);

    if (nextEnd <= startYear) {
      onEndYearChange(nextEnd);
      onStartYearChange(nextEnd - 1);
      return;
    }

    onEndYearChange(nextEnd);
  };

  const startOptions = years.filter((year) => year < endYear);
  const endOptions = years.filter((year) => year > startYear);

  return (
    <div className="filter-row year-filter-row">
      <div>
        <label className="filter-label" htmlFor="start-year">
          From year
        </label>
        <select
          id="start-year"
          className="filter-select"
          value={startYear}
          onChange={(e) => handleStartChange(e.target.value)}
        >
          {startOptions.map((year) => (
            <option key={`start-${year}`} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="filter-label" htmlFor="end-year">
          To year
        </label>
        <select
          id="end-year"
          className="filter-select"
          value={endYear}
          onChange={(e) => handleEndChange(e.target.value)}
        >
          {endOptions.map((year) => (
            <option key={`end-${year}`} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}