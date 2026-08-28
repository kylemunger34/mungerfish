import { memo } from "react";
import rod_img from "../assets/rod.png";

const Rod = memo(function Rod({
  rod,
  editMode,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onClick,
}) {
  return (
    <div
      className={`rod ${editMode ? "editable" : ""}`}
      style={{
        left: `calc(50% + ${rod.x}px)`,
        top: `calc(50% + ${rod.y}px)`,
        transform: "translate(-50%, -50%)",
      }}
      onPointerDown={(event) =>
        onPointerDown(event, rod.rod_id)
      }
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={() => onClick(rod)}
    >
      <img
        src={rod_img}
        alt="Rod"
        className="rod-image"
      />
    </div>
  );
});

export default memo(Rod);