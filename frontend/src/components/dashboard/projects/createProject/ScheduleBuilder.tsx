"use client";

import type { ProjectScheduleEntry } from "@sumbi/shared-types";

interface ScheduleBuilderProps {
  value: ProjectScheduleEntry[];
  onChange: (schedule: ProjectScheduleEntry[]) => void;
  error?: string;
}

const CZECH_MONTHS = [
  "Leden",
  "Únor",
  "Březen",
  "Duben",
  "Květen",
  "Červen",
  "Červenec",
  "Srpen",
  "Září",
  "Říjen",
  "Listopad",
  "Prosinec",
];

// Month-by-month schedule builder for project timeline
export function ScheduleBuilder({
  value,
  onChange,
  error,
}: ScheduleBuilderProps) {
  const handleAddMonth = () => {
    onChange([...value, { date: CZECH_MONTHS[0], task: "" }]);
  };

  const handleRemoveMonth = (index: number) => {
    const newSchedule = value.filter((_, i) => i !== index);
    onChange(newSchedule);
  };

  const handleMonthChange = (index: number, date: string) => {
    const newSchedule = [...value];
    newSchedule[index] = { ...newSchedule[index], date };
    onChange(newSchedule);
  };

  const handleTasksChange = (index: number, task: string) => {
    const newSchedule = [...value];
    newSchedule[index] = { ...newSchedule[index], task };
    onChange(newSchedule);
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      <label className="block text-sm font-medium text-text-primary">
        Časový harmonogram (Optional)
      </label>

      {/* Schedule entries */}
      {value.length === 0 ? (
        <p className="text-sm text-text-secondary italic">
          No schedule entries yet. Click "Add Month" to start creating your timeline.
        </p>
      ) : (
        <div className="space-y-4">
          {value.map((entry, index) => (
            <div
              key={index}
              className="p-2 sm:p-4 bg-background-secondary rounded-lg border border-border space-y-3"
            >
              {/* Entry header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">
                  {index + 1}. Month
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveMonth(index)}
                  className="p-1 text-text-secondary hover:text-danger hover:bg-danger/10 dark:hover:bg-danger/10 rounded transition-colors duration-200"
                  aria-label={`Remove month ${index + 1}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Month dropdown */}
              <div>
                <label
                  htmlFor={`month-${index}`}
                  className="block text-xs text-text-secondary mb-1"
                >
                  Month
                </label>
                <select
                  id={`month-${index}`}
                  value={entry.date}
                  onChange={(e) => handleMonthChange(index, e.target.value)}
                  className="w-full px-3 py-2 bg-background-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-interactive-primary/20 focus:border-interactive-primary"
                >
                  {CZECH_MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tasks textarea */}
              <div>
                <label
                  htmlFor={`tasks-${index}`}
                  className="block text-xs text-text-secondary mb-1"
                >
                  Tasks
                </label>
                <textarea
                  id={`tasks-${index}`}
                  value={entry.task}
                  onChange={(e) => handleTasksChange(index, e.target.value)}
                  rows={3}
                  placeholder="Describe what needs to be done in this month..."
                  className="w-full px-3 py-2 bg-background-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-interactive-primary/20 focus:border-interactive-primary resize-y"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add month button */}
      <button
        type="button"
        onClick={handleAddMonth}
        className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:text-primary-dark transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Add Month
      </button>

      {/* Error message */}
      {error && (
        <p className="text-xs text-danger dark:text-danger">{error}</p>
      )}
    </div>
  );
}
