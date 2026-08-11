import { useState } from "react";

const SUGGESTED_COLORS = ["#f4a259", "#f25c54", "#f6bd60", "#84a98c", "#6699cc", "#b298dc", "#f2a6c9"];

export function ColorPickerModal({
  onPick,
  submitting,
}: {
  onPick: (color: string) => void;
  submitting: boolean;
}) {
  const [color, setColor] = useState("#f4a259");

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Pick this week's color</h2>
        <p>Every note you spike this week will be this color.</p>
        <div className="color-swatches">
          {SUGGESTED_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-swatch${c === color ? " color-swatch--selected" : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={c}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Custom color"
          />
        </div>
        <button type="button" disabled={submitting} onClick={() => onPick(color)}>
          {submitting ? "Saving…" : "Start the week"}
        </button>
      </div>
    </div>
  );
}
