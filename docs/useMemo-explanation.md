# Understanding useMemo() in useFilteredProjects

## The Problem Without useMemo

```typescript
// ❌ WITHOUT useMemo - BAD PERFORMANCE
function useFilteredProjects(projects, userId) {
  // This code runs EVERY time the component re-renders
  // Even if projects and userId haven't changed!

  const student = projects.filter(p => p.student_id === userId);
  const supervisor = projects.filter(p => p.supervisor_id === userId);
  const opponent = projects.filter(p => p.opponent_id === userId);

  return { student, supervisor, opponent, all: projects };
}

// Component re-renders happen when:
// - viewMode changes (grid/list)
// - teacherTab changes (supervisor/opponent)
// - Any state update
// Result: Filtering runs UNNECESSARILY many times!
```

## The Solution With useMemo

```typescript
// ✅ WITH useMemo - OPTIMIZED
function useFilteredProjects(projects, userId) {
  return useMemo(() => {
    // This code ONLY runs when projects or userId change

    const student = projects.filter(p => p.student_id === userId);
    const supervisor = projects.filter(p => p.supervisor_id === userId);
    const opponent = projects.filter(p => p.opponent_id === userId);

    return { student, supervisor, opponent, all: projects };
  }, [projects, userId]); // <-- Dependency array
}
```

## How It Works: Step by Step

### First Render:
```
1. React calls useFilteredProjects(projects, userId)
2. useMemo sees it's the first time → runs the callback function
3. Filters all projects (expensive operation)
4. Returns: { student: [...], supervisor: [...], opponent: [...], all: [...] }
5. useMemo SAVES this result in memory
6. useMemo REMEMBERS: projects = [100 items], userId = "abc123"
```

### Second Render (viewMode changes from grid to list):
```
1. React calls useFilteredProjects(projects, userId) again
2. useMemo checks dependencies:
   - projects === previous projects? YES ✓
   - userId === previous userId? YES ✓
3. useMemo says: "Nothing changed, I'll return the saved result!"
4. Returns the SAME object from memory (no filtering!)
5. Component renders instantly
```

### Third Render (new project added to database):
```
1. React calls useFilteredProjects(projects, userId) again
2. useMemo checks dependencies:
   - projects === previous projects? NO ✗ (new array!)
   - userId === previous userId? YES ✓
3. useMemo says: "Projects changed, I need to recalculate!"
4. Runs the callback function again
5. Filters all projects with new data
6. Returns new filtered result
7. Saves this new result for next time
```

## Why Return useMemo Directly?

```typescript
function useFilteredProjects(projects, userId) {
  return useMemo(() => {
    // calculation here
    return { student, supervisor, opponent, all };
  }, [projects, userId]);
}

// This is equivalent to:
function useFilteredProjects(projects, userId) {
  const memoizedValue = useMemo(() => {
    // calculation here
    return { student, supervisor, opponent, all };
  }, [projects, userId]);

  return memoizedValue;
}

// But shorter and cleaner!
```

## Real Performance Impact

### Scenario: 100 projects, user switches tabs 5 times

**Without useMemo:**
```
Initial render:    Filter 100 projects (3 times) = 300 operations
Tab switch 1:      Filter 100 projects (3 times) = 300 operations
Tab switch 2:      Filter 100 projects (3 times) = 300 operations
Tab switch 3:      Filter 100 projects (3 times) = 300 operations
Tab switch 4:      Filter 100 projects (3 times) = 300 operations
Tab switch 5:      Filter 100 projects (3 times) = 300 operations
-----------------------------------------------------------
TOTAL:             1,800 operations
```

**With useMemo:**
```
Initial render:    Filter 100 projects (3 times) = 300 operations
Tab switch 1:      Return cached result        = 0 operations
Tab switch 2:      Return cached result        = 0 operations
Tab switch 3:      Return cached result        = 0 operations
Tab switch 4:      Return cached result        = 0 operations
Tab switch 5:      Return cached result        = 0 operations
-----------------------------------------------------------
TOTAL:             300 operations (83% faster!)
```

## The Dependency Array

```typescript
useMemo(() => {
  // calculation
}, [projects, userId])
   // ↑ This tells React: "Only recalculate when these change"
```

### What happens with different dependencies:

```typescript
// ❌ Missing dependencies - STALE DATA BUG
useMemo(() => {
  return projects.filter(p => p.student_id === userId);
}, []); // Empty array = never updates!

// ❌ Too many dependencies - NO OPTIMIZATION
useMemo(() => {
  return projects.filter(p => p.student_id === userId);
}, [projects, userId, viewMode, teacherTab]);
// Recalculates even when viewMode changes (unnecessary)

// ✅ Correct dependencies - OPTIMAL
useMemo(() => {
  return projects.filter(p => p.student_id === userId);
}, [projects, userId]);
// Only recalculates when the actual data changes
```

## Common Misconception

```typescript
// People sometimes think useMemo is like this:
const result = useMemo(someValue, dependencies); // ❌ WRONG

// But it's actually:
const result = useMemo(() => someValue, dependencies); // ✓ CORRECT
//                      ↑ Function that returns the value
```

## When to Use useMemo

### ✅ Good use cases:
- Expensive calculations (filtering, sorting, complex math)
- Creating objects/arrays that are used as dependencies elsewhere
- Preventing child component re-renders (when passed as props)

### ❌ Don't use for:
- Simple arithmetic (1 + 2)
- String concatenation
- Single array access (arr[0])
- The overhead of useMemo is more expensive than the operation!

## Visual Analogy

Think of useMemo like a smart assistant:

```
Without useMemo (Forgetful Assistant):
Boss: "What are the supervisor projects?"
Assistant: *Looks through all 100 projects* "Here they are!"
Boss: "What are the supervisor projects?" (1 second later)
Assistant: *Looks through all 100 projects AGAIN* "Here they are!"

With useMemo (Smart Assistant):
Boss: "What are the supervisor projects?"
Assistant: *Looks through all 100 projects* "Here they are!" *Writes down the answer*
Boss: "What are the supervisor projects?" (1 second later)
Assistant: *Checks notes* "Here's the same list I gave you before!"
Boss: "We hired a new student, what are the supervisor projects?"
Assistant: *Notices the change* "Let me check again!" *Looks through all 101 projects*
```

## Summary

| Aspect | Explanation |
|--------|-------------|
| **What** | Caches the result of an expensive calculation |
| **When** | Recalculates only when dependencies change |
| **Why** | Prevents unnecessary re-computation on every render |
| **How** | `useMemo(() => calculation, [dependencies])` |
| **Returns** | The cached value directly |
