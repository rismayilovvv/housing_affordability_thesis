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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

const countryColors = ["#2f6fdd", "#d97706", "#16a34a", "#dc2626"];

export default function MultiCountryComparisonChart({
  title,
  labels,
  series,
  metricLabel,
}) {
  const colors = useThemeColors();

  const chartData = useMemo(
    () => ({
      labels,
      datasets: series.map((item, index) => ({
        label: `${item.country} - ${metricLabel}`,
        data: item.values,
        borderColor: countryColors[index],
        backgroundColor: countryColors[index],
        tension: 0.32,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2.8,
        spanGaps: true,
      })),
    }),
    [labels, series, metricLabel]
  );

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
        },
      },
      scales: {
        x: {
          ticks: { color: colors.textSoft },
          grid: { color: colors.gridColor },
        },
        y: {
          title: {
            display: true,
            text: metricLabel,
            color: colors.textMain,
            font: { weight: "700" },
          },
          ticks: { color: colors.textSoft },
          grid: { color: colors.gridColor },
          beginAtZero: false,
        },
      },
    }),
    [title, metricLabel, colors]
  );

  return (
    <div className="chart-card">
      <div className="chart-wrapper">
        <Line
          key={`${colors.theme}-${title}-${series.map((item) => item.country).join("-")}`}
          data={chartData}
          options={options}
        />
      </div>
    </div>
  );
}