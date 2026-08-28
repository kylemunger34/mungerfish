import { useEffect, useMemo, useState } from "react";
import "./Statistics.css";

function Statistics({ onBack }) {
  const [fish, setFish] = useState([]);
  const [loading, setLoading] = useState(true);


  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    weight: false,
    color: false,
    bait: false,
    rod: false,
    species: false,
  });

  useEffect(() => {
    fetch("http://localhost:3001/api/fish")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load fish");
        }

        return response.json();
      })
      .then((data) => {
        setFish(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load fish:", error);
        setLoading(false);
      });
  }, []);

  const filterOptions = [
    { key: "bait", label: "Bait" },
    { key: "color", label: "Color" },
    { key: "weight", label: "Weight" },
    { key: "rod", label: "Rod" },
    { key: "species", label: "Species" },
  ];

  const toggleFilter = (key) => {
    setSelectedFilters((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const selectedKeys = filterOptions
    .filter((filter) => selectedFilters[filter.key])
    .map((filter) => filter.key);

  const getDateValue = (caughtAt) => {
    if (!caughtAt) {
      return "Unknown";
    }

    const date = new Date(caughtAt);

    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }

    return date.toLocaleDateString();
  };

  const getFilterValue = (catchRecord, key) => {
    switch (key) {
      case "date":
        return getDateValue(catchRecord.caught_at);

      case "bait":
        return catchRecord.bait_name || "None";

      case "color":
        return catchRecord.color_name || "None";

      case "weight":
        return catchRecord.weight_name || "None";

      case "rod":
        return catchRecord.rod_name || "None";

      case "species":
        return catchRecord.species || "Unknown";

      default:
        return "Unknown";
    }
  };

    const filteredFish = fish.filter((item) => {

    const caughtDate = new Date(item.caught_at);

    if (startDate) {
        const start = new Date(`${startDate}T00:00:00`);

        if (caughtDate < start) {
        return false;
        }
    }

    if (endDate) {
        const end = new Date(`${endDate}T23:59:59`);

        if (caughtDate > end) {
        return false;
        }
    }

    return true;
    });

  const chartData = useMemo(() => {
    if (selectedKeys.length === 0) {
      return [];
    }

    const combinations = {};

    filteredFish.forEach((catchRecord) => {
      const combination = selectedKeys
        .map((key) =>
          getFilterValue(catchRecord, key)
        )
        .join(" × ");

      combinations[combination] =
        (combinations[combination] || 0) + 1;
    });

    return Object.entries(combinations)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [
    filteredFish,
    selectedKeys,
  ]);

  const totalCatches = chartData.reduce(
    (total, item) => total + item.count,
    0
  );

  return (
    <div className="statistics-page">

      {/* =========================
          Header
      ========================= */}

      <div className="statistics-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ←
        </button>

        <h2>Statistics</h2>

        <div className="statistics-header-spacer" />

      </div>

      {/* =========================
          Content
      ========================= */}

      <div className="statistics-content">

        {/* =========================
            Filter Selection
        ========================= */}

        <div className="statistics-section">

          <span className="statistics-section-label">
            Chart By
          </span>

          <div className="statistics-date-filter">

            <div className="statistics-date">

                <span className="statistics-date-label">
                From
                </span>

                <input
                className="statistics-date-input"
                type="date"
                value={startDate}
                onChange={(event) =>
                    setStartDate(event.target.value)
                }
                />

            </div>

            <div className="statistics-date">

                <span className="statistics-date-label">
                To
                </span>

                <input
                className="statistics-date-input"
                type="date"
                value={endDate}
                onChange={(event) =>
                    setEndDate(event.target.value)
                }
                />

            </div>

            </div>

          <div className="statistics-filters">

            {filterOptions.map((filter) => (

              <button
                key={filter.key}
                className={`statistics-filter ${
                  selectedFilters[filter.key]
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  toggleFilter(filter.key)
                }
              >

                <span>
                  {filter.label}
                </span>

                <span className="statistics-checkbox">
                  {selectedFilters[filter.key]
                    ? "✓"
                    : ""}
                </span>

              </button>

            ))}

          </div>

        </div>

        {/* =========================
            Chart
        ========================= */}

        <div className="statistics-chart-section">

          {selectedKeys.length === 0 ? (

            <div className="statistics-empty">
              Select at least one option to display the chart.
            </div>

          ) : loading ? (

            <div className="statistics-empty">
              Loading catches...
            </div>

          ) : chartData.length === 0 ? (

            <div className="statistics-empty">
              No catches recorded.
            </div>

          ) : (

            <>

              <div className="statistics-chart">

                <div
                  className="statistics-pie"
                  style={{
                    background:
                      createPieGradient(chartData),
                  }}
                />

                <div className="statistics-total">

                  <span className="statistics-total-number">
                    {totalCatches}
                  </span>

                  <span className="statistics-total-label">
                    Catches
                  </span>

                </div>

              </div>

              <div className="statistics-legend">

                {chartData.map((item, index) => {

                    const percentage =
                    (item.count / totalCatches) * 100;

                    const parts = item.name.split(" × ");

                    return (
                    <div
                        className="statistics-legend-item"
                        key={item.name}
                    >

                        <span
                        className="statistics-legend-dot"
                        style={{
                            background:
                            getChartColor(index),
                        }}
                        />

                        <div className="statistics-legend-name">

                        {selectedKeys.map((key, partIndex) => (

                            <div
                            className="statistics-legend-part"
                            key={`${item.name}-${key}`}
                            >

                            <span className="statistics-legend-label">
                                {filterOptions.find(
                                (filter) =>
                                    filter.key === key
                                )?.label}
                            </span>

                            <span className="statistics-legend-part-value">
                                {parts[partIndex]}
                            </span>

                            </div>

                        ))}

                        </div>

                        <div className="statistics-legend-stats">

                        <span className="statistics-legend-count">
                            {item.count}
                        </span>

                        <span className="statistics-legend-value">
                            {percentage.toFixed(1)}%
                        </span>

                        </div>

                    </div>
                    );

                })}

                </div>

            </>

          )}

        </div>

      </div>

    </div>
  );
}

/* =========================
   Chart Colors
========================= */

function getChartColor(index) {

  const colors = [
    "#a9ccb9",
    "#7fa894",
    "#d8b878",
    "#91a8b5",
    "#c28f8f",
    "#9d9abe",
    "#b6a078",
    "#7ca9a1",
    "#b59bba",
    "#8caa7c",
  ];

  return colors[index % colors.length];
}

/* =========================
   Pie Chart
========================= */

function createPieGradient(data) {

  const total = data.reduce(
    (sum, item) => sum + item.count,
    0
  );

  if (total === 0) {
    return "#dcebe4";
  }

  let currentPercentage = 0;

  const sections = data.map((item, index) => {

    const start = currentPercentage;

    currentPercentage +=
      (item.count / total) * 100;

    return `${getChartColor(index)} ${start}% ${currentPercentage}%`;
  });

  return `conic-gradient(${sections.join(", ")})`;
}

export default Statistics;