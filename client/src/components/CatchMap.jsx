import { useEffect } from "react";
import "./CatchMap.css";
import { formatDateTime } from "../utils/dateUtils";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./CatchMap.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FitMapToCatches({ catches }) {
  const map = useMap();

  useEffect(() => {
    if (catches.length === 0) return;

    const bounds = L.latLngBounds(
      catches.map((item) => [
        Number(item.latitude),
        Number(item.longitude),
      ])
    );

    map.fitBounds(bounds, {
      padding: [35, 35],
      maxZoom: 16,
    });
  }, [map, catches]);

  return null;
}

function CatchMap({ catches }) {
  const catchesWithLocation = catches.filter(
    (item) =>
      item.latitude !== null &&
      item.longitude !== null &&
      !isNaN(Number(item.latitude)) &&
      !isNaN(Number(item.longitude))
  );

  const defaultCenter = [42.3, -85.6];

  return (
    <div className="catch-map-container">

      {catchesWithLocation.length === 0 ? (

        <div className="catch-map-empty">
          <p>
            No catches with GPS coordinates.
          </p>
        </div>

      ) : (

        <MapContainer
          center={defaultCenter}
          zoom={13}
          className="catch-map"
          zoomControl={true}
        >

          <FitMapToCatches
            catches={catchesWithLocation}
          />

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {catchesWithLocation.map((item) => (

            <Marker
              key={item.fish_id}
              position={[
                Number(item.latitude),
                Number(item.longitude),
              ]}
            >

              <Popup>

                <div className="catch-map-popup">

                  <strong>
                    {item.species || "Unknown Fish"}
                  </strong>

                  <div>
                    {item.fish_size
                      ? `${item.fish_size}" long`
                      : "Size unknown"}
                  </div>

                  <div>
                    Rod: {item.rod_name || "Unknown"}
                  </div>

                  <div>
                    Bait: {item.bait_name || "None"}
                  </div>

                  <div>
                    Color: {item.color_name || "None"}
                  </div>

                  <div>
                    Weight: {item.weight_name || "None"}
                  </div>

                  <div className="catch-map-popup-date">
                    {item.caught_at
                      ? formatDateTime(item.caught_at)
                      : ""}
                  </div>

                </div>

              </Popup>

            </Marker>

          ))}

        </MapContainer>

      )}

    </div>
  );
}

export default CatchMap;