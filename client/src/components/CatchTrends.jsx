
import { useEffect, useState } from "react";
import "./CatchTrends.css";
import { formatDateKey, formatDateOnly } from "../utils/dateUtils";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

function CatchTrends({
    onBack,
    baits,
    colors,
    weights,
    rods,
    species,
}) {
    const [fish, setFish] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterOpen, setFilterOpen] = useState(false);

    const [filters, setFilters] = useState({
        date: formatDateKey(new Date()),
        weight: "",
        color: "",
        bait: "",
        rod: "",
        species: "",
    });

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/fish`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch fish");
                }

                return response.json();
            })
            .then((data) => {
                setFish(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setError("Failed to load catch records");
                setLoading(false);
            });
    }, []);

    const filteredCatches = fish.filter((fish) => {
        if (filters.date) {
            const fishDate = formatDateKey(fish.caught_at);

            if (fishDate !== filters.date) {
                return false;
            }
        }

        if (
            filters.weight &&
            String(fish.weight_id) !== String(filters.weight)
        ) {
            return false;
        }

        if (
            filters.color &&
            String(fish.color_id) !== String(filters.color)
        ) {
            return false;
        }

        if (
            filters.bait &&
            String(fish.bait_id) !== String(filters.bait)
        ) {
            return false;
        }

        if (
            filters.rod &&
            String(fish.rod_id) !== String(filters.rod)
        ) {
            return false;
        }

        if (
            filters.species &&
            String(fish.species_id) !== String(filters.species)
        ) {
            return false;
        }

        return true;
    });

    const chartData = [...filteredCatches]
        .sort(
            (a, b) =>
                new Date(a.caught_at) -
                new Date(b.caught_at)
        )
        .map((fish, index, sortedFish) => {
            const date = new Date(fish.caught_at);

            const time =
                date.getHours() +
                date.getMinutes() / 60 +
                date.getSeconds() / 3600;

            // Start every fish on the baseline
            let level = 0.5;

            // Check previous catches for overlapping times
            for (let i = index - 1; i >= 0; i--) {
                const previousDate = new Date(
                    sortedFish[i].caught_at
                );

                const previousTime =
                    previousDate.getHours() +
                    previousDate.getMinutes() / 60 +
                    previousDate.getSeconds() / 3600;

                // About 2 minutes of horizontal distance
                if (Math.abs(time - previousTime) < 0.2) {
                    level += 0.05;
                } else {
                    break;
                }
            }

            return {
                time,
                level,
                fishId: fish.fish_id,
                timeLabel: date.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                }),
            };
        });

    if (loading) {
        return (
            <div className="catch-page">

                <div className="catch-header">

                    <button
                        className="back-button"
                        onClick={onBack}
                    >
                        ←
                    </button>

                    <h1>Trends</h1>

                </div>

                <p>Loading...</p>

            </div>
        );
    }

    if (error) {
        return (
            <div className="catch-page">

                <div className="catch-header">

                    <button
                        className="back-button"
                        onClick={onBack}
                    >
                        ←
                    </button>

                    <h1>Trends</h1>

                </div>

                <p>{error}</p>

            </div>
        );
    }

    return (
        <div className="catch-page">

            <div className="catch-header">

                <button
                    className="back-button"
                    onClick={() => {
                        if (filterOpen) {
                            setFilterOpen(false);
                        } else {
                            onBack();
                        }
                    }}
                >
                    ←
                </button>

                <h1>
                    {filterOpen ? "Filters" : "Trends"}
                </h1>

                {!filterOpen && (
                    <button
                        className="catch-filter-button"
                        onClick={() =>
                            setFilterOpen((current) => !current)
                        }
                    >
                        ☷
                    </button>
                )}

            </div>

            {filterOpen ? (

                <div className="catch-filter-panel">

                    <button
                        className="catch-clear-filters"
                        onClick={() => {
                            setFilters({
                                date: formatDateKey(new Date()),
                                weight: "",
                                color: "",
                                bait: "",
                                rod: "",
                                species: "",
                            });

                            setFilterOpen(false);
                        }}
                    >
                        Clear Filters
                    </button>

                    <div className="catch-filter">

                        <span className="rod-detail-label">
                            Date
                        </span>

                        <input
                            className="rod-input"
                            type="date"
                            value={filters.date}
                            onChange={(event) =>
                                setFilters({
                                    ...filters,
                                    date: event.target.value,
                                })
                            }
                        />

                    </div>

                    <div className="catch-filter">

                        <span className="rod-detail-label">
                            Weight
                        </span>

                        <select
                            className="rod-input"
                            value={filters.weight}
                            onChange={(event) =>
                                setFilters({
                                    ...filters,
                                    weight: event.target.value,
                                })
                            }
                        >
                            <option value="">
                                All weights
                            </option>

                            {weights.map((weight) => (
                                <option
                                    key={weight.weight_id}
                                    value={weight.weight_id}
                                >
                                    {weight.name}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="catch-filter">

                        <span className="rod-detail-label">
                            Color
                        </span>

                        <select
                            className="rod-input"
                            value={filters.color}
                            onChange={(event) =>
                                setFilters({
                                    ...filters,
                                    color: event.target.value,
                                })
                            }
                        >
                            <option value="">
                                All colors
                            </option>

                            {colors.map((color) => (
                                <option
                                    key={color.color_id}
                                    value={color.color_id}
                                >
                                    {color.name}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="catch-filter">

                        <span className="rod-detail-label">
                            Bait
                        </span>

                        <select
                            className="rod-input"
                            value={filters.bait}
                            onChange={(event) =>
                                setFilters({
                                    ...filters,
                                    bait: event.target.value,
                                })
                            }
                        >
                            <option value="">
                                All baits
                            </option>

                            {baits.map((bait) => (
                                <option
                                    key={bait.bait_id}
                                    value={bait.bait_id}
                                >
                                    {bait.name}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="catch-filter">

                        <span className="rod-detail-label">
                            Rod
                        </span>

                        <select
                            className="rod-input"
                            value={filters.rod}
                            onChange={(event) =>
                                setFilters({
                                    ...filters,
                                    rod: event.target.value,
                                })
                            }
                        >
                            <option value="">
                                All rods
                            </option>

                            {rods.map((rod) => (
                                <option
                                    key={rod.rod_id}
                                    value={rod.rod_id}
                                >
                                    {rod.name}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="catch-filter">

                        <span className="rod-detail-label">
                            Species
                        </span>

                        <select
                            className="rod-input"
                            value={filters.species}
                            onChange={(event) =>
                                setFilters({
                                    ...filters,
                                    species: event.target.value,
                                })
                            }
                        >
                            <option value="">
                                All species
                            </option>

                            {species.map((item) => (
                                <option
                                    key={item.species_id}
                                    value={item.species_id}
                                >
                                    {item.name}
                                </option>
                            ))}
                        </select>

                    </div>

                </div>

            ) : (

                <div className="catch-trends-content">

                    <div className="catch-trends-date">

                        <span className="rod-detail-label">
                            Catch Activity
                        </span>

                        <span className="catch-trends-date-value">
                            {filters.date
                                ? formatDateOnly(filters.date)
                                : "All dates"}
                        </span>

                    </div>

                    {filteredCatches.length === 0 ? (

                        <div className="catch-trends-empty">
                            <span>
                                No catches for this selection.
                            </span>
                        </div>

                    ) : (

                        <div className="catch-trends-chart">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 20,
                                        right: 8,
                                        left: 8,
                                        bottom: 20,
                                    }}
                                >

                                    <XAxis
                                        type="number"
                                        dataKey="time"
                                        domain={["dataMin", "dataMax"]}
                                        tickFormatter={(value) => {
                                            const totalMinutes = Math.round(value * 60);

                                            const hour24 = Math.floor(totalMinutes / 60);
                                            const minutes = totalMinutes % 60;

                                            const hour12 =
                                                hour24 === 0
                                                    ? 12
                                                    : hour24 > 12
                                                        ? hour24 - 12
                                                        : hour24;

                                            const period = hour24 >= 12 ? "PM" : "AM";

                                            return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
                                        }}
                                        tick={{
                                            fontSize: 8,
                                            fill: "#71817a",
                                        }}
                                    />

                                    <YAxis
                                        hide
                                        domain={[0.4, 1]}
                                    />

                                    <Tooltip
                                        formatter={() => ["Fish", "Catch"]}
                                        labelFormatter={(_, payload) =>
                                            payload?.[0]?.payload?.timeLabel || ""
                                        }
                                    />

                                    <Line
                                        type="linear"
                                        dataKey="level"
                                        stroke="none"
                                        dot={{
                                            r: 4,
                                            fill: "#263a35",
                                            stroke: "#ffffff",
                                            strokeWidth: 1,
                                        }}
                                        activeDot={{
                                            r: 6,
                                        }}
                                    />

                                </LineChart>
                            </ResponsiveContainer>

                        </div>

                    )}

                    <div className="catch-count-tab">
                        {filteredCatches.length}{" "}
                        {filteredCatches.length === 1 ? "Fish" : "Fish"}
                    </div>

                </div>

            )}

        </div>
    );
}

export default CatchTrends;

