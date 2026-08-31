import { useEffect, useState } from "react";
import CatchMap from "./CatchMap";
import { formatDateKey, formatDateTime } from "../utils/dateUtils";

function CatchRecords({
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
    const [expandedFish, setExpandedFish] = useState(null);

    const [filterOpen, setFilterOpen] = useState(false);

    const [mapView, setMapView] = useState(false);

    const [filters, setFilters] = useState({
    date: "",
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

    const toggleFish = (fishId) => {
        setExpandedFish((current) =>
            current === fishId ? null : fishId
        );
    };

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

                    <h1>Records</h1>
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

                    <h1>Records</h1>
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
                    } else if (mapView) {
                        setMapView(false);
                    } else {
                        onBack();
                    }
                    }}
                >
                    ←
                </button>

                <h1>
                    {filterOpen
                    ? "Filters"
                    : mapView
                        ? "Map"
                        : "Records"}
                </h1>

                {!filterOpen && (
                    <button
                    className="catch-map-button"
                    onClick={() => setMapView((current) => !current)}
                    >
                    {mapView ? "×" : "⌖"}
                    </button>
                )}

                <button
                    className="catch-filter-button"
                    onClick={() => setFilterOpen(!filterOpen)}
                >
                    ☷
                </button>

                </div>

            {filterOpen ? (
                    <div className="catch-filter-panel">
                        <button
                        className="catch-clear-filters"
                        onClick={() => {
                            setFilters({
                            date: "",
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
                            <option value="">All weights</option>

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
                            <option value="">All colors</option>

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
                            <option value="">All baits</option>

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
                            <option value="">All rods</option>

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
                            <option value="">All species</option>

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
                ) : mapView ? (

                <CatchMap catches={filteredCatches} />

                ) : filteredCatches.length === 0 ? (
                    <div className="no-catches">
                        <p>
                            {fish.length === 0
                                ? "No fish caught yet."
                                : "No fish match your filters."}
                        </p>
                    </div>
                ) : (
                    <div className="catch-list">

                        {filteredCatches.map((fish) => {

                            const isExpanded =
                                expandedFish === fish.fish_id;

                            return (
                                <div
                                    className={`catch-card ${
                                        isExpanded
                                            ? "expanded"
                                            : ""
                                    }`}
                                    key={fish.fish_id}
                                >

                                    {/* Main clickable section */}
                                    <button
                                        className="catch-summary"
                                        onClick={() =>
                                            toggleFish(
                                                fish.fish_id
                                            )
                                        }
                                    >

                                        <div className="catch-summary-info">

                                            <span className="catch-species">
                                                {fish.species || "Unknown"}
                                            </span>

                                            <span className="catch-date">
                                                {formatDateTime(fish.caught_at)}
                                            </span>

                                        </div>

                                        <span className="fish-size">
                                            {fish.fish_size}"
                                        </span>

                                    </button>


                                    {/* Expanded details */}
                                    {isExpanded && (
                                        <div className="catch-expanded">

                                            <div className="catch-details">

                                                <div className="catch-detail">
                                                    <span className="detail-label">
                                                        Rod
                                                    </span>

                                                    <span>
                                                        {fish.rod_name ||
                                                            "Unknown"}
                                                    </span>
                                                </div>


                                                <div className="catch-detail">
                                                    <span className="detail-label">
                                                        Bait
                                                    </span>

                                                    <span>
                                                        {fish.bait_name ||
                                                            "Unknown"}
                                                    </span>
                                                </div>


                                                <div className="catch-detail">
                                                    <span className="detail-label">
                                                        Color
                                                    </span>

                                                    <span>
                                                        {fish.color_name ||
                                                            "Unknown"}
                                                    </span>
                                                </div>


                                                <div className="catch-detail">
                                                    <span className="detail-label">
                                                        Weight
                                                    </span>

                                                    <span>
                                                        {fish.weight_name ||
                                                            "Unknown"}
                                                    </span>
                                                </div>

                                            </div>

                                            <div className="catch-location">
                                            <span>
                                                📍 {fish.latitude},{" "}
                                                {fish.longitude}
                                            </span>

                                            <button
                                            className="delete-catch-button"
                                            onClick={async (event) => {
                                                event.stopPropagation();

                                                try {
                                                const response = await fetch(
                                                    `${import.meta.env.VITE_API_URL}/api/fish/${fish.fish_id}`,
                                                    {
                                                    method: "DELETE",
                                                    }
                                                );

                                                if (!response.ok) {
                                                    const errorData = await response.json();

                                                    throw new Error(
                                                    errorData.error || "Failed to delete fish"
                                                    );
                                                }

                                                // Remove fish from the displayed list
                                                setFish((currentFish) =>
                                                    currentFish.filter(
                                                    (item) => item.fish_id !== fish.fish_id
                                                    )
                                                );

                                                } catch (error) {
                                                console.error("Failed to delete fish:", error);
                                                }
                                            }}
                                            >
                                            ×
                                            </button>
                                            </div>
                                            

                                        </div>
                                    )}

                                </div>
                            );
                        })}

                    </div>
                )}
            <div className="catch-count-tab">
                {filteredCatches.length}{" "}
                {filteredCatches.length === 1 ? "Fish" : "Fish"}
            </div>
        </div>
    );
}

export default CatchRecords;