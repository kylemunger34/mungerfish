import { useState } from "react";
import "./ManageItems.css";

function ManageItems({
    onBack,
    baits,
    setBaits,
    colors,
    setColors,
    weights,
    setWeights,
    species,
    setSpecies,
}) {
    const [newItem, setNewItem] = useState({
        baits: "",
        colors: "",
        weights: "",
        species: "",
    });

    const [adding, setAdding] = useState(null);
    const [error, setError] = useState("");

    const addItem = async (type) => {
        const name = newItem[type].trim();

        if (!name) return;

        setError("");

        const endpoint = `/api/${type}`;

        try {
            const response = await fetch(
                `http://localhost:3001${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || `Failed to add ${type}`
                );
            }

            if (type === "baits") {
                setBaits((current) =>
                    [...current, data].sort((a, b) =>
                        a.name.localeCompare(b.name)
                    )
                );
            }

            if (type === "colors") {
                setColors((current) =>
                    [...current, data].sort((a, b) =>
                        a.name.localeCompare(b.name)
                    )
                );
            }

            if (type === "weights") {
                setWeights((current) =>
                    [...current, data].sort((a, b) =>
                        a.name.localeCompare(b.name)
                    )
                );
            }

            if (type === "species") {
                setSpecies((current) =>
                    [...current, data].sort((a, b) =>
                        a.name.localeCompare(b.name)
                    )
                );
            }

            setNewItem((current) => ({
                ...current,
                [type]: "",
            }));

            setAdding(null);

        } catch (error) {
            console.error(`Failed to add ${type}:`, error);
            setError(error.message);
        }
    };

    const deleteItem = async (type, id) => {
        setError("");

        try {
            const response = await fetch(
                `http://localhost:3001/api/${type}/${id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || `Failed to delete ${type}`
                );
            }

            if (type === "baits") {
                setBaits((current) =>
                    current.filter(
                        (item) => item.bait_id !== id
                    )
                );
            }

            if (type === "colors") {
                setColors((current) =>
                    current.filter(
                        (item) => item.color_id !== id
                    )
                );
            }

            if (type === "weights") {
                setWeights((current) =>
                    current.filter(
                        (item) => item.weight_id !== id
                    )
                );
            }

            if (type === "species") {
                setSpecies((current) =>
                    current.filter(
                        (item) => item.species_id !== id
                    )
                );
            }

        } catch (error) {
            console.error(`Failed to delete ${type}:`, error);
            setError(error.message);
        }
    };

    const renderSection = (
        title,
        type,
        items,
        idField
    ) => {
        return (
            <div className="manage-section">

                <div className="manage-section-header">
                    <span className="rod-detail-label">
                        {title}
                    </span>

                    <button
                        className="manage-add-button"
                        onClick={() => {
                            setAdding(
                                adding === type ? null : type
                            );
                            setError("");
                        }}
                    >
                        {adding === type ? "×" : "+"}
                    </button>
                </div>

                {adding === type && (
                    <div className="manage-add-row">

                        <input
                            className="rod-input"
                            type="text"
                            placeholder={`New ${title.toLowerCase().slice(0, -1)}`}
                            value={newItem[type]}
                            onChange={(event) =>
                                setNewItem({
                                    ...newItem,
                                    [type]: event.target.value,
                                })
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    addItem(type);
                                }
                            }}
                            autoFocus
                        />

                        <button
                            className="manage-save-button"
                            onClick={() => addItem(type)}
                        >
                            Add
                        </button>

                    </div>
                )}

                <div className="manage-items-list">

                    {items.length === 0 ? (
                        <div className="manage-empty">
                            No {title.toLowerCase()} added.
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                className="manage-item"
                                key={item[idField]}
                            >

                                <span className="manage-item-name">
                                    {item.name}
                                </span>

                                <button
                                    className="manage-delete-button"
                                    onClick={() =>
                                        deleteItem(
                                            type,
                                            item[idField]
                                        )
                                    }
                                >
                                    ×
                                </button>

                            </div>
                        ))
                    )}

                </div>

            </div>
        );
    };

    return (
        <div className="manage-page">

            <div className="manage-header">

                <button
                    className="back-button"
                    onClick={onBack}
                >
                    ←
                </button>

                <h1>Manage Items</h1>

            </div>

            <div className="manage-content">

                {error && (
                    <div className="manage-error">
                        {error}
                    </div>
                )}

                {renderSection(
                    "Baits",
                    "baits",
                    baits,
                    "bait_id"
                )}

                {renderSection(
                    "Colors",
                    "colors",
                    colors,
                    "color_id"
                )}

                {renderSection(
                    "Weights",
                    "weights",
                    weights,
                    "weight_id"
                )}

                {renderSection(
                    "Species",
                    "species",
                    species,
                    "species_id"
                )}

            </div>

        </div>
    );
}

export default ManageItems;