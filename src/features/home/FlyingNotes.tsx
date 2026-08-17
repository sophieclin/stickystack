import type { CSSProperties } from "react";

type NoteStyle = CSSProperties & { "--rotate": string };

// Same palette used by the demo pile (see demoStack.ts) and the real color picker.
const NOTES = [
  { color: "#6699cc", top: "8%", size: 46, rotate: -8, duration: 26, delay: 0 },
  { color: "#f25c54", top: "62%", size: 34, rotate: 12, duration: 22, delay: -6 },
  { color: "#f6bd60", top: "22%", size: 40, rotate: -14, duration: 30, delay: -14 },
  { color: "#84a98c", top: "78%", size: 30, rotate: 6, duration: 20, delay: -3 },
  { color: "#f2a6c9", top: "45%", size: 38, rotate: -5, duration: 27, delay: -19 },
  { color: "#f4a259", top: "88%", size: 32, rotate: 15, duration: 24, delay: -10 },
];

/** Purely decorative — ambient sticky notes drifting behind the home page content. */
export function FlyingNotes() {
  return (
    <div className="flying-notes" aria-hidden="true">
      {NOTES.map((note, i) => (
        <span
          key={i}
          className="flying-note"
          style={
            {
              top: note.top,
              width: note.size,
              height: note.size,
              backgroundColor: note.color,
              animationDuration: `${note.duration}s`,
              animationDelay: `${note.delay}s`,
              "--rotate": `${note.rotate}deg`,
            } as NoteStyle
          }
        />
      ))}
    </div>
  );
}
