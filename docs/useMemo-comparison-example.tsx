/**
 * Side-by-side comparison: With vs Without useMemo
 * This shows why returning useMemo directly is beneficial
 */

import { useMemo } from "react";

// ========================================
// WITHOUT useMemo - Performance Problem
// ========================================

function ProjectsPageWithoutMemo({ projects, userId, userRole }) {
  // ❌ This filtering runs EVERY TIME the component re-renders
  // Even when you just switch from grid to list view!

  const student = projects.filter(p => p.student_id === userId);
  const supervisor = projects.filter(p => p.supervisor_id === userId);
  const opponent = projects.filter(p => p.opponent_id === userId);

  const filteredProjects = { student, supervisor, opponent, all: projects };

  // When user clicks grid/list button:
  // 1. viewMode state changes
  // 2. Component re-renders
  // 3. ALL THREE FILTERS RUN AGAIN (even though projects didn't change!)
  // 4. Result: Wasted CPU cycles

  return (
    <div>
      {/* Render based on userRole */}
      {userRole === 'teacher' && filteredProjects.supervisor}
    </div>
  );
}

// ========================================
// WITH useMemo - Optimized Version
// ========================================

function ProjectsPageWithMemo({ projects, userId, userRole }) {
  // ✅ Filtering only runs when projects or userId actually changes

  const filteredProjects = useMemo(() => {
    const student = projects.filter(p => p.student_id === userId);
    const supervisor = projects.filter(p => p.supervisor_id === userId);
    const opponent = projects.filter(p => p.opponent_id === userId);

    return { student, supervisor, opponent, all: projects };
  }, [projects, userId]);

  // When user clicks grid/list button:
  // 1. viewMode state changes
  // 2. Component re-renders
  // 3. useMemo checks: "Did projects change? No. Did userId change? No."
  // 4. useMemo returns the SAME cached result
  // 5. Result: Instant render, no wasted filtering

  return (
    <div>
      {/* Render based on userRole */}
      {userRole === 'teacher' && filteredProjects.supervisor}
    </div>
  );
}

// ========================================
// ALTERNATIVE: useMemo in a separate function
// ========================================

// This is what we did in your code:
function useFilteredProjects(projects, userId) {
  // We return useMemo directly because the function's PURPOSE
  // is to provide a memoized value
  return useMemo(() => {
    const student = projects.filter(p => p.student_id === userId);
    const supervisor = projects.filter(p => p.supervisor_id === userId);
    const opponent = projects.filter(p => p.opponent_id === userId);

    return { student, supervisor, opponent, all: projects };
  }, [projects, userId]);
}

// Usage in component:
function ProjectsPageClean({ projects, userId, userRole }) {
  // Clean and readable - the function name tells you it's memoized
  const filteredProjects = useFilteredProjects(projects, userId);

  return (
    <div>
      {userRole === 'teacher' && filteredProjects.supervisor}
    </div>
  );
}

// ========================================
// Real-world execution trace
// ========================================

/*
SCENARIO: Teacher views 100 projects, switches tabs 3 times

WITHOUT useMemo:
-----------------
Render 1 (Initial load):
  → Filter student:    100 iterations
  → Filter supervisor: 100 iterations
  → Filter opponent:   100 iterations
  Total: 300 operations

Render 2 (Switch to "As Opponent" tab):
  → Filter student:    100 iterations  (WASTED - not even shown!)
  → Filter supervisor: 100 iterations  (WASTED - not shown!)
  → Filter opponent:   100 iterations
  Total: 300 operations (200 wasted)

Render 3 (Switch back to "As Supervisor" tab):
  → Filter student:    100 iterations  (WASTED)
  → Filter supervisor: 100 iterations
  → Filter opponent:   100 iterations  (WASTED)
  Total: 300 operations (200 wasted)

Render 4 (Change view from grid to list):
  → Filter student:    100 iterations  (WASTED)
  → Filter supervisor: 100 iterations  (WASTED - same data!)
  → Filter opponent:   100 iterations  (WASTED)
  Total: 300 operations (ALL WASTED!)

TOTAL: 1,200 operations


WITH useMemo:
--------------
Render 1 (Initial load):
  → Filter student:    100 iterations
  → Filter supervisor: 100 iterations
  → Filter opponent:   100 iterations
  → useMemo saves result
  Total: 300 operations

Render 2 (Switch to "As Opponent" tab):
  → useMemo checks: projects changed? NO
  → useMemo checks: userId changed? NO
  → Return cached result
  Total: 0 operations (instant!)

Render 3 (Switch back to "As Supervisor" tab):
  → useMemo checks: projects changed? NO
  → useMemo checks: userId changed? NO
  → Return cached result
  Total: 0 operations (instant!)

Render 4 (Change view from grid to list):
  → useMemo checks: projects changed? NO
  → useMemo checks: userId changed? NO
  → Return cached result
  Total: 0 operations (instant!)

TOTAL: 300 operations (75% faster!)
*/

// ========================================
// Why return useMemo directly?
// ========================================

// Option 1: Return useMemo directly (CLEANER)
function useFilteredProjects_Clean(projects, userId) {
  return useMemo(() => {
    // calculation
    return { student: [], supervisor: [], opponent: [] };
  }, [projects, userId]);
}

// Option 2: Store in variable first (MORE VERBOSE)
function useFilteredProjects_Verbose(projects, userId) {
  const memoizedValue = useMemo(() => {
    // calculation
    return { student: [], supervisor: [], opponent: [] };
  }, [projects, userId]);

  return memoizedValue; // Extra line, same result
}

// Both do EXACTLY the same thing!
// Option 1 is preferred because:
// - Shorter and cleaner
// - Common pattern in React
// - Makes it clear the function's sole purpose is to return the memoized value

// ========================================
// Key Takeaway
// ========================================

/*
useMemo(() => calculation, [dependencies])

Think of it as:

useMemo(
  () => calculation,  // Function that RETURNS a value
  [dependencies]      // When to recalculate
)

NOT:

useMemo(
  calculation,  // ❌ This would be the value itself, not a function
  [dependencies]
)

The first argument MUST be a function, because React needs to:
1. Call it when dependencies change
2. Not call it when dependencies stay the same
*/
