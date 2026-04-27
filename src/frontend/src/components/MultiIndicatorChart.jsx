import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function useThemeColors() {
  const getColors = () => {
    const css = getComputedStyle(document.documentElement);

    return {
      theme: document.documentElement.getAttribute("data-theme") || "light",
      textMain: css.getPropertyValue("--text-main").trim() || "#17263c",
      textSoft: css.getPropertyValue("--text-soft").trim() || "#617287",
      gridColor: css.getPropertyValue("--grid-color").trim() || "#d9e2ee",
    };
  };

  const [colors, setColors] = useState(getColors);

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(getColors()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}

const lineColors = {
  housing_price_index: "#2f6fdd",
  mortgage_rate: "#d97706",
  income: "#16a34a",
  unemployment: "#dc2626",
};

function normalizeSeries(values) {
  const firstValid = values.find((value) => value !== null && value !== undefined);

  if (!firstValid || Number(firstValid) === 0) {
    return values.map(() => null);
  }

  return values.map((value) =>
    value === null || value === undefined
      ? null
      : (Number(value) / Number(firstValid)) * 100
  );
}

export default function MultiIndicatorChart({
  data,
  title,
  selectedIndicators,
  indicatorOptions,
}) {
  const colors = useThemeColors();

  const labels = useMemo(() => data.map((item) => item.year), [data]);

  const chartData = useMemo(() => {
    return {
      labels,
      datasets: selectedIndicators.map((indicatorKey) => {
        const option = indicatorOptions.find((item) => item.key === indicatorKey);
        const rawValues = data.map((item) => item[indicatorKey] ?? null);
        const normalizedValues = normalizeSeries(rawValues);

        return {
          label: option?.label || indicatorKey,
          data: normalizedValues,
          rawValues,
          borderColor: lineColors[indicatorKey],
          backgroundColor: lineColors[indicatorKey],
          tension: 0.32,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 2.8,
          spanGaps: true,
        };
      }),
    };
  }, [labels, data, selectedIndicators, indicatorOptions]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: colors.textMain,
            boxWidth: 14,
            padding: 18,
            font: {
              size: 12,
              weight: "700",
            },
          },
        },
        title: {
          display: true,
          text: title,
          color: colors.textMain,
          font: {
            size: 18,
            weight: "700",
          },
          padding: {
            top: 10,
            bottom: 18,
          },
        },
        tooltip: {
          backgroundColor:
            colors.theme === "dark"
              ? "rgba(6, 16, 34, 0.96)"
              : "rgba(255, 255, 255, 0.96)",
          titleColor: colors.textMain,
          bodyColor: colors.textSoft,
          borderColor: colors.gridColor,
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context) => {
              const dataset = context.dataset;
              const rawValue = dataset.rawValues?.[context.dataIndex];

              if (rawValue === null || rawValue === undefined) {
                return `${dataset.label}: N/A`;
              }

              const normalized = Number(context.raw).toFixed(2);
              const original = Number(rawValue).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              });

              return `${dataset.label}: ${normalized} index points | actual: ${original}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: colors.textSoft,
            font: {
              size: 12,
            },
          },
          grid: {
            color: colors.gridColor,
          },
        },
        y: {
          title: {
            display: true,
            text: "Indexed value, first selected year = 100",
            color: colors.textMain,
            font: {
              weight: "700",
            },
          },
          ticks: {
            color: colors.textSoft,
            font: {
              size: 12,
            },
          },
          grid: {
            color: colors.gridColor,
          },
          beginAtZero: false,
        },
      },
    }),
    [title, colors]
  );

  return (
    <div className="chart-card">
      <div className="chart-note">
        Values are shown as an index where the first selected year equals 100.
        Tooltips show both indexed and original values.
      </div>

      <div className="chart-wrapper">
        <Line
          key={`${colors.theme}-${title}-${selectedIndicators.join("-")}`}
          data={chartData}
          options={options}
        />
      </div>
    </div>
  );
}