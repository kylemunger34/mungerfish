import { useEffect, useState, useRef } from "react";
import boat from "./assets/pontoon.png";
import Rod from "./components/Rod";
import CatchRecords from "./components/CatchRecords";
import Statistics from "./components/Statistics";
import CatchTrends from "./components/CatchTrends";
import ManageItems from "./components/ManageItems";

import "./App.css";

function App() {
  const [rods, setRods] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [baits, setBaits] = useState([]);
  const [colors, setColors] = useState([]);
  const [weights, setWeights] = useState([]);
  const [selectedRod, setSelectedRod] = useState(null);
  const [rodPageEditMode, setRodPageEditMode] = useState(false);
  const [fishPage, setFishPage] = useState(false);
  const [species, setSpecies] = useState([]);
  const [fishSpecies, setFishSpecies] = useState("");
  const [fishLength, setFishLength] = useState("");
  const [gpsStatus, setGpsStatus] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [catchRecordsPage, setCatchRecordsPage] = useState(false);
  const [statisticsPage, setStatisticsPage] = useState(false);
  const [catchTrendsPage, setCatchTrendsPage] = useState(false);
  const [manageItemsPage, setManageItemsPage] = useState(false);
  const bodyRef = useRef(null);
  const dragRef = useRef({
    rodId: null,
    offsetX: 0,
    offsetY: 0,
    x: 0,
    y: 0,
    centerX: 0,
    centerY: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/rods`).then((response) =>
        response.json()
      ),
      fetch(`${import.meta.env.VITE_API_URL}/api/baits`).then((response) =>
        response.json()
      ),
      fetch(`${import.meta.env.VITE_API_URL}/api/colors`).then((response) =>
        response.json()
      ),
      fetch(`${import.meta.env.VITE_API_URL}/api/weights`).then((response) =>
        response.json()
      ),
      fetch(`${import.meta.env.VITE_API_URL}/api/species`).then((response) =>
        response.json()
      ),
    ])
      .then(
        ([
          rodsData,
          baitsData,
          colorsData,
          weightsData,
          speciesData,
        ]) => {
          setRods(rodsData);
          setBaits(baitsData);
          setColors(colorsData);
          setWeights(weightsData);
          setSpecies(speciesData);
        }
      )
      .catch((error) => {
        console.error("Failed to load data:", error);
      });
  }, []);

  const handleRodClick = (rod) => {
    if (editMode) return;

    if (dragRef.current.rodId !== null) return;

    setSelectedRod(rod);
    setRodPageEditMode(false);
  };

  const handleDeleteRod = async () => {
      try {
          const response = await fetch(
              `${import.meta.env.VITE_API_URL}/api/rods/${selectedRod.rod_id}`,
              {
                  method: "DELETE",
              }
          );

          if (!response.ok) {
              const errorData = await response.json();

              throw new Error(
                  errorData.error || "Failed to delete rod"
              );
          }

          setRods((currentRods) =>
              currentRods.filter(
                  (rod) => rod.rod_id !== selectedRod.rod_id
              )
          );

          setSelectedRod(null);
          setRodPageEditMode(false);

      } catch (error) {
          console.error("Failed to delete rod:", error);
      }
  };

  const handleSaveRod = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/${selectedRod.rod_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: selectedRod.name,
            bait_id: selectedRod.bait_id || null,
            color_id: selectedRod.color_id || null,
            weight_id: selectedRod.weight_id || null,
            notes: selectedRod.notes || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.error || "Failed to save rod"
        );
      }

      setRods((currentRods) =>
        currentRods.map((rod) =>
          rod.rod_id === selectedRod.rod_id
            ? selectedRod
            : rod
        )
      );

      setRodPageEditMode(false);

      console.log(`Rod ${selectedRod.rod_id} saved`);

    } catch (error) {
      console.error("Failed to save rod:", error);
    }
  };

  const handleAddRod = async () => {
      try {
          const response = await fetch(
              `${import.meta.env.VITE_API_URL}/api/rods`,
              {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                      name: `Rod ${rods.length + 1}`,
                      bait_id: null,
                      color_id: null,
                      weight_id: null,
                      notes: null,
                      x: 0,
                      y: 0,
                  }),
              }
          );

          if (!response.ok) {
              const errorData = await response.json();

              throw new Error(
                  errorData.error || "Failed to add rod"
              );
          }

          const newRod = await response.json();

          setRods((currentRods) => [
              ...currentRods,
              newRod,
          ]);

      } catch (error) {
          console.error("Failed to add rod:", error);
      }
  };

  const handlePointerDown = (event, rodId) => {
    if (!editMode) return;

    event.preventDefault();

    const bodyRect = bodyRef.current.getBoundingClientRect();

    const centerX = bodyRect.left + bodyRect.width / 2;
    const centerY = bodyRect.top + bodyRect.height / 2;

    const rod = rods.find((r) => r.rod_id === rodId);

    if (!rod) return;

    dragRef.current = {
      rodId,

      offsetX: event.clientX - centerX - rod.x,
      offsetY: event.clientY - centerY - rod.y,

      x: rod.x,
      y: rod.y,

      centerX,
      centerY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!editMode) return;

    const {
      rodId,
      offsetX,
      offsetY,
      centerX,
      centerY,
    } = dragRef.current;

    if (rodId === null) return;

    const newX =
      event.clientX -
      centerX -
      offsetX;

    const newY =
      event.clientY -
      centerY -
      offsetY;

    dragRef.current.x = newX;
    dragRef.current.y = newY;

    const rodElement = event.currentTarget;

    rodElement.style.left =
      `calc(50% + ${newX}px)`;

    rodElement.style.top =
      `calc(50% + ${newY}px)`;
  };

  const handlePointerUp = async (event) => {
    if (!editMode) return;

    const {
      rodId,
      offsetX,
      offsetY,
    } = dragRef.current;

    if (rodId === null) return;

    const bodyRect =
      bodyRef.current.getBoundingClientRect();

    const centerX =
      bodyRect.left + bodyRect.width / 2;

    const centerY =
      bodyRect.top + bodyRect.height / 2;

    const finalX =
      event.clientX -
      centerX -
      offsetX;

    const finalY =
      event.clientY -
      centerY -
      offsetY;

    dragRef.current.x = finalX;
    dragRef.current.y = finalY;

    setRods((currentRods) =>
      currentRods.map((rod) =>
        rod.rod_id === rodId
          ? {
              ...rod,
              x: finalX,
              y: finalY,
            }
          : rod
      )
    );

    const element = event.currentTarget;
    const pointerId = event.pointerId;

    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }

    dragRef.current = {
      rodId: null,
      offsetX: 0,
      offsetY: 0,
      x: 0,
      y: 0,
      centerX: 0,
      centerY: 0,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/rods/${rodId}/position`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            x: Math.round(finalX),
            y: Math.round(finalY),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.error || "Failed to save position"
        );
      }

      console.log(
        `Rod ${rodId} saved at ${Math.round(finalX)}, ${Math.round(finalY)}`
      );

    } catch (error) {
      console.error(
        "Failed to save rod position:",
        error
      );
    }
  };

  const handleRecordFish = () => {
    if (!selectedRod) return;

    if (!fishSpecies || !fishLength) {
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatus("GPS is not supported by this device.");
      return;
    }

    setGpsStatus("Getting location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setGpsStatus("Recording fish...");

        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/fish`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                  rod_id: selectedRod.rod_id,
                  bait_id: selectedRod.bait_id,
                  color_id: selectedRod.color_id,
                  weight_id: selectedRod.weight_id,
                  species_id: Number(fishSpecies),
                  size: Number(fishLength),
                  latitude: latitude,
                  longitude: longitude,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();

            throw new Error(
              errorData.error || "Failed to record fish"
            );
          }

          setGpsStatus("Fish recorded!");

          console.log("Fish recorded:", {
            rod_id: selectedRod.rod_id,
            species_id: Number(fishSpecies),
            size: Number(fishLength),
            latitude,
            longitude,
          });

          setTimeout(() => {
            setFishPage(false);
          }, 500);

        } catch (error) {
          console.error(
            "Failed to record fish:",
            error
          );

          setGpsStatus(
            "Failed to record fish."
          );
        }
      },
      (error) => {
        console.error(
          "Failed to get GPS location:",
          error
        );

        setGpsStatus(
          "Unable to get your GPS location."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="app">

      <header className="header">

        <div className="header-title">
          Mungerfish
        </div>

        <div className="header-buttons">

          <button
            className="options-button"
            onClick={() => setMenuOpen((open) => !open)}
          >
            ☰
          </button>

        </div>

      </header>

      {menuOpen && (
        <>
          <div
            className="menu-overlay"
            onClick={() => setMenuOpen(false)}
          />

          <div className="side-menu">
            <div className="side-menu-content">

              <button
                className="side-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setStatisticsPage(false);
                  setCatchRecordsPage(true);
                  setCatchTrendsPage(false);
                  setManageItemsPage(false);
                }}
              >
                Records
              </button>

              <button
                className="side-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setCatchRecordsPage(false);
                  setStatisticsPage(true);
                  setCatchTrendsPage(false);
                  setManageItemsPage(false);
                }}
              >
                Statistics
              </button>

              <button
                  className="side-menu-item"
                  onClick={() => {
                      setMenuOpen(false);
                      setCatchRecordsPage(false);
                      setCatchTrendsPage(true);
                      setStatisticsPage(false);
                      setManageItemsPage(false);
                  }}
              >
                  Trends
              </button>

              <button
                className="side-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setCatchRecordsPage(false);
                  setStatisticsPage(false);
                  setCatchTrendsPage(false);
                  setManageItemsPage(true);
                }}
              >
                Manage Items
              </button>

            </div>
          </div>
        </>
      )}
      <div
        className="body"
        ref={bodyRef}
      >
          {catchRecordsPage ? (
            <CatchRecords
              onBack={() => setCatchRecordsPage(false)}
              baits={baits}
              colors={colors}
              weights={weights}
              rods={rods}
              species={species}
            />
          ) : catchTrendsPage ? (
                <CatchTrends
                    onBack={() => setCatchTrendsPage(false)}
                    baits={baits}
                    colors={colors}
                    weights={weights}
                    rods={rods}
                    species={species}
                />
            ) : manageItemsPage ? (
              <ManageItems
                onBack={() => setManageItemsPage(false)}
                baits={baits}
                colors={colors}
                weights={weights}
                species={species}
                setBaits={setBaits}
                setColors={setColors}
                setWeights={setWeights}
                setSpecies={setSpecies}
              />
            ) : statisticsPage ? (
            <Statistics
              onBack={() => setStatisticsPage(false)}
              baits={baits}
              colors={colors}
              weights={weights}
              rods={rods}
              species={species}
            />
          ) : !selectedRod ? (
          <>
            <img
              src={boat}
              alt="Pontoon"
              className="boat"
            />

            {rods.map((rod) => (
              <Rod
                key={rod.rod_id}
                rod={rod}
                editMode={editMode}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={handleRodClick}
              />
            ))}

            <div className="edit-controls">

              {editMode && (
                <button
                  className="add-rod-button"
                  onClick={handleAddRod}
                >
                  +
                </button>
              )}

              <button
                className={`edit-button ${
                  editMode ? "active" : ""
                }`}
                onClick={() => setEditMode(!editMode)}
              >
                ✎
              </button>

            </div>
          </>
        ) : fishPage ? (
          <div className="fish-page">

            <div className="fish-page-header">

              <button
                className="back-button"
                onClick={() => setFishPage(false)}
              >
                ←
              </button>

              <h2>Fish On!</h2>

              <div className="fish-header-spacer"></div>

            </div>

            <div className="fish-page-content">

              <div className="rod-detail">

                <span className="rod-detail-label">
                  Species
                </span>

                <select
                  className="rod-input"
                  value={fishSpecies}
                  onChange={(event) =>
                    setFishSpecies(
                      event.target.value
                        ? Number(event.target.value)
                        : ""
                    )
                  }
                >
                  <option value="">
                    Select species
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

              <div className="rod-detail">

                <span className="rod-detail-label">
                  Length
                </span>

                <input
                  className="rod-input"
                  type="number"
                  inputMode="decimal"
                  placeholder="Length"
                  value={fishLength}
                  onChange={(event) =>
                    setFishLength(event.target.value)
                  }
                />

              </div>

              <div className="gps-status">
                {gpsStatus}
              </div>

              <button
                className="record-fish-button"
                onClick={handleRecordFish}
                disabled={!fishSpecies || !fishLength}
              >
                Record Fish
              </button>

            </div>

          </div>
        ) :(
          <div className="rod-page">

            <div className="rod-page-header">

              <button
                className="back-button"
                onClick={() => {
                  setSelectedRod(null);
                  setRodPageEditMode(false);
                }}
              >
                ←
              </button>

              <h2>
                {selectedRod.name || "Rod"}
              </h2>

              {rodPageEditMode && (
                <button
                  className="rod-delete-button"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/api/rods/${selectedRod.rod_id}`,
                        {
                          method: "DELETE",
                        }
                      );

                      if (!response.ok) {
                        const errorData = await response.json();

                        throw new Error(
                          errorData.error || "Failed to delete rod"
                        );
                      }

                      setRods((currentRods) =>
                        currentRods.filter(
                          (rod) => rod.rod_id !== selectedRod.rod_id
                        )
                      );

                      setSelectedRod(null);
                      setRodPageEditMode(false);

                    } catch (error) {
                      console.error("Failed to delete rod:", error);
                    }
                  }}
                >
                  ×
                </button>
              )}

              <button
                className={`rod-edit-button ${
                  rodPageEditMode ? "active" : ""
                }`}
                onClick={() => {
                  if (rodPageEditMode) {
                    handleSaveRod();
                  } else {
                    setRodPageEditMode(true);
                  }
                }}
              >
                ✎
              </button>

            </div>


            <div className="rod-page-content">
              {rodPageEditMode && (
                <div className="rod-detail">

                  <span className="rod-detail-label">
                    Name
                  </span>

                  {rodPageEditMode ? (
                    <input
                      className="rod-input"
                      type="text"
                      value={selectedRod.name || ""}
                      onChange={(event) =>
                        setSelectedRod({
                          ...selectedRod,
                          name: event.target.value,
                        })
                      }
                    />
                  ) : (
                    <span className="rod-detail-value">
                      {selectedRod.name || "Unnamed"}
                    </span>
                  )}

                </div>
              )}

              <div className="rod-detail">

                <span className="rod-detail-label">
                  Bait
                </span>

                {rodPageEditMode ? (
                  <select
                    className="rod-input"
                    value={selectedRod.bait_id || ""}
                    onChange={(event) =>
                      setSelectedRod({
                        ...selectedRod,
                        bait_id: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                  >
                    <option value="">
                      None
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
                ) : (
                  <span className="rod-detail-value">
                    {baits.find(
                      (bait) =>
                        bait.bait_id === selectedRod.bait_id
                    )?.name || "None"}
                  </span>
                )}

              </div>


              <div className="rod-detail">

                <span className="rod-detail-label">
                  Color
                </span>

                {rodPageEditMode ? (
                  <select
                    className="rod-input"
                    value={selectedRod.color_id || ""}
                    onChange={(event) =>
                      setSelectedRod({
                        ...selectedRod,
                        color_id: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                  >
                    <option value="">
                      None
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
                ) : (
                  <span className="rod-detail-value">
                    {colors.find(
                      (color) =>
                        color.color_id === selectedRod.color_id
                    )?.name || "None"}
                  </span>
                )}

              </div>


              <div className="rod-detail">

                <span className="rod-detail-label">
                  Weight
                </span>

                {rodPageEditMode ? (
                  <select
                    className="rod-input"
                    value={selectedRod.weight_id || ""}
                    onChange={(event) =>
                      setSelectedRod({
                        ...selectedRod,
                        weight_id: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                  >
                    <option value="">
                      None
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
                ) : (
                  <span className="rod-detail-value">
                    {weights.find(
                      (weight) =>
                        weight.weight_id === selectedRod.weight_id
                    )?.name || "None"}
                  </span>
                )}

              </div>


              <div className="rod-detail">

                <span className="rod-detail-label">
                  Notes
                </span>

                {rodPageEditMode ? (
                  <textarea
                    className="rod-input rod-notes"
                    value={selectedRod.notes || ""}
                    onChange={(event) =>
                      setSelectedRod({
                        ...selectedRod,
                        notes: event.target.value,
                      })
                    }
                  />
                ) : (
                  <span className="rod-detail-value">
                    {selectedRod.notes || "No notes"}
                  </span>
                )}

              </div>

              {!rodPageEditMode && (
                <button
                  className="fish-on-button"
                  onClick={() => {
                    setFishSpecies("");
                    setFishLength("");
                    setGpsStatus("");
                    setFishPage(true);
                  }}
                >
                  Fish On!
                </button>
              )}

            </div>

          </div>
        )}
      </div>

    </div>
  );
}

export default App;