type Macro = { label: string; value: number; target: number; color: string };

function Bar({ label, value, target, color }: Macro) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  return (
    <div className="flex-1">
      <div className="flex items-baseline justify-between text-xs mb-1">
        <span className="font-medium" style={{ color }}>
          {label}
        </span>
        <span className="text-muted tabular-nums">
          {Math.round(value)}/{Math.round(target)} g
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--ring-track)] overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function MacroBars({
  proteine,
  carboidrati,
  grassi,
  targets,
}: {
  proteine: number;
  carboidrati: number;
  grassi: number;
  targets: { proteine: number; carboidrati: number; grassi: number };
}) {
  return (
    <div className="flex gap-4">
      <Bar label="Proteine" value={proteine} target={targets.proteine} color="var(--proteine)" />
      <Bar label="Carbo" value={carboidrati} target={targets.carboidrati} color="var(--carboidrati)" />
      <Bar label="Grassi" value={grassi} target={targets.grassi} color="var(--grassi)" />
    </div>
  );
}
