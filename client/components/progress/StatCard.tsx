const COLOR_MAP: Record<string, string> = {
  indigo: "border-indigo-800 text-indigo-400",
  green: "border-green-800 text-green-400",
  yellow: "border-yellow-800 text-yellow-400",
  purple: "border-purple-800 text-purple-400",
};

export function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className={`bg-gray-900 border rounded-xl p-4 ${COLOR_MAP[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}
