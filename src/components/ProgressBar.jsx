export default function ProgressBar({ done, total, showLabel = true }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Выполнено</span>
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            {done} <span className="text-gray-400 dark:text-gray-500 font-normal">из</span> {total}
          </span>
        </div>
      )}
      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
