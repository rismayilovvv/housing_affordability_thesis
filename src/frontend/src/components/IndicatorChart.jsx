import { useEffect, useMemo, useRef, useState } from "react";
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
      chartBlue: css.getPropertyValue("--chart-blue").trim() || "#2d67ba",
      chartRed: css.getPropertyValue("--chart-red").trim() || "#bf6b1a",
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

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function IndicatorChart({
  data,
  title,
  firstLabel,
  secondLabel,
  firstKey,
  secondKey,
}) {
  const chartRef = useRef(null);
  const colors = useThemeColors();
  const labels = useMemo(() => data.map((item) => item.year), [data]);

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: firstLabel,
          data: data.map((item) => item[firstKey]),
          yAxisID: "y",
          borderColor: colors.chartBlue,
          backgroundColor: "rgba(77, 125, 240, 0.18)",
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2.4,
          spanGaps: true,
        },
        {
          label: secondLabel,
          data: data.map((item) => item[secondKey]),
          yAxisID: "y1",
          borderColor: colors.chartRed,
          backgroundColor: "rgba(244, 162, 97, 0.18)",
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2.4,
          spanGaps: true,
        },
      ],
    }),
    [labels, data, firstLabel, secondLabel, firstKey, secondKey, colors]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: { color: colors.textMain, boxWidth: 14, padding: 18 },
        },
        title: {
          display: true,
          text: title,
          color: colors.textMain,
          font: { size: 18, weight: "700" },
          padding: { top: 10, bottom: 20 },
        },
      },
      scales: {
        y: {
          type: "linear",
          position: "left",
          title: { display: true, text: firstLabel, color: colors.textMain },
          ticks: { color: colors.textSoft },
          grid: { color: colors.gridColor },
        },
        y1: {
          type: "linear",
          position: "right",
          title: { display: true, text: secondLabel, color: colors.textMain },
          ticks: { color: colors.textSoft },
          grid: { drawOnChartArea: false },
        },
        x: {
          ticks: { color: colors.textSoft },
          grid: { color: colors.gridColor },
        },
      },
    }),
    [title, firstLabel, secondLabel, colors]
  );

  const exportPng = () => {
    const chart = chartRef.current;
    if (!chart) return;

    const canvas = chart.canvas;
    const sourceContext = canvas.getContext("2d");

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;

    const exportContext = exportCanvas.getContext("2d");

    const backgroundColor =
      colors.theme === "dark" ? "#0f1c31" : "#ffffff";

    exportContext.fillStyle = backgroundColor;
    exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    exportContext.drawImage(canvas, 0, 0);

    const link = document.createElement("a");
    link.download = `${title.replaceAll(" ", "_")}.png`;
    link.href = exportCanvas.toDataURL("image/png", 1.0);
    link.click();
  };

  const exportCsv = () => {
    const rows = [
      ["Year", firstLabel, secondLabel],
      ...data.map((item) => [item.year, item[firstKey] ?? "", item[secondKey] ?? ""]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    downloadFile(`${title.replaceAll(" ", "_")}.csv`, csv, "text/csv");
  };

  return (
    <div className="chart-card">
      <div className="chart-export-bar">
        <button type="button" onClick={exportPng}>Export PNG</button>
        <button type="button" onClick={exportCsv}>Export CSV</button>
      </div>

      <div className="chart-wrapper">
        <Line
          ref={chartRef}
          key={`${colors.theme}-${title}`}
          data={chartData}
          options={options}
        />
      </div>
    </div>
  );
}