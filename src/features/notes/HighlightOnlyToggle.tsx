export function HighlightOnlyToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`highlight-only-toggle${active ? " highlight-only-toggle--active" : ""}`}
      aria-pressed={active}
      title={active ? "Show all tasks" : "Show highlighted tasks only"}
      onClick={onToggle}
    >
      ★ Only
    </button>
  );
}
