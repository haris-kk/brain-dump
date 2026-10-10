# Signals in Angular

## What problem does it solve?

Before signals, Angular used Zone.js to detect changes — it monkey-patched browser APIs and checked the entire component tree after every event. It worked but was inefficient. Angular had no way to know *what* changed, so it checked *everything*.

Signals tell Angular exactly what changed and what depends on it. Only those parts update.

## One-sentence definition

A signal is a reactive value that Angular tracks — when it changes, anything that reads it updates automatically.

## Mental model

```
Plain variable:   Angular guesses when it changed
Signal:           Angular knows exactly when it changed
```

---

## The four concepts

### 1. `signal()` — declare state

```typescript
tasks     = signal<Dump[]>([]);   // initial value is empty array
sheetOpen = signal(false);        // initial value is false
```

Read it by calling it like a function:
```typescript
this.tasks()       // returns Dump[]
this.sheetOpen()   // returns false
```

In a template:
```html
{{ facade.tasks().length }}
@if (facade.sheetOpen()) { ... }
```

---

### 2. `.set()` vs `.update()` — write state

Use `.set()` when the new value has nothing to do with the old one:
```typescript
this.sheetOpen.set(true);   // don't need to know old value
this.tasks.set([]);         // reset — don't need old value
```

Use `.update()` when the new value depends on the previous one:
```typescript
this.tasks.update(current => [...current, newTask]);     // need current to add
this.tasks.update(current => current.filter(...));       // need current to remove
```

---

### 3. `computed()` — derive state

Read-only signal whose value is always derived from other signals.

```typescript
taskCount = computed(() => this.tasks().length);
hasTasks  = computed(() => this.tasks().length > 0);
workTasks = computed(() => this.tasks().filter(t => t.category === 'work'));
```

Two rules:
- Left side is always `computed()` — you never write to it
- Right side must have at least one signal — otherwise Angular has nothing to track

**Lazy** — doesn't run until first read. After that, caches the result and only re-runs when a dependency signal changes.

```typescript
// won't compute until something reads taskCount()
taskCount = computed(() => this.tasks().length);
```

Plain variables inside `computed` are NOT tracked:
```typescript
multiplier = 2; // plain variable
doubled = computed(() => this.count() * multiplier);
// only count() is tracked — if multiplier changes, doubled won't recompute
```

---

### 4. `effect()` — side effects

Runs a side effect whenever its signal dependencies change. Always watching, not triggered by actions.

```typescript
constructor() {
  effect(() => {
    localStorage.setItem('tasks', JSON.stringify(this.tasks()));
  });
}
```

Must run inside an **injection context**:
```typescript
// ✅ constructor
constructor() { effect(() => { ... }); }

// ✅ field initializer
persistEffect = effect(() => { ... });

// ❌ regular method — throws error
save() { effect(() => { ... }); }
```

**effect vs method:**
```
effect  → "whenever X state is true, do Y"  — always watching
method  → "when this action happens, do Y"  — triggered explicitly
```

**Gate pattern** — when you need an effect to start only after an action:
```typescript
isSaveStarted = signal(false);

constructor() {
  effect(() => {
    if (!this.isSaveStarted()) return; // sleeps until gate opens
    console.log('now watching:', this.tasks());
  });
}

startSave() {
  this.isSaveStarted.set(true); // open the gate
}
```

Use the gate when you want continuous watching after a trigger.
Use a plain method call if you only need to fire once.

---

## Quick reference

| | Purpose | Writable? | Lazy? |
|---|---|---|---|
| `signal()` | hold state | yes | — |
| `computed()` | derive state from signals | no | yes |
| `effect()` | side effects on signal change | — | no |

## Real usage in this app — `DumpFacade`

```typescript
tasks     = signal<Dump[]>([]);                          // state
sheetOpen = signal(false);                               // state
taskCount = computed(() => this.tasks().length);         // derived

constructor() {
  effect(() => {                                         // auto-persist
    localStorage.setItem('tasks', JSON.stringify(this.tasks()));
  });
}

addTask(...)    { this.tasks.update(current => [...current, newTask]); }
removeTask(...) { this.tasks.update(current => current.filter(...));   }
```

## Key points to remember

- Signals replace plain variables for state Angular needs to track
- `.set()` for new value, `.update()` when you need the previous value
- `computed` = read-only signal, lazy, derived from other signals
- `effect` = always watching, not action-triggered — use a method for one-off reactions
- All four must be read/created inside an injection context or template
