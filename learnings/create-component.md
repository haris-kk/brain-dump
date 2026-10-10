# createComponent in Angular

## What problem does it solve?

Normal Angular components are created declaratively — you put them in a template and Angular handles the rest. But sometimes you need to create a component:

- From a **service**, not a template
- **After** an async event (HTTP response, timer, user action from anywhere)
- **Outside** the component tree — attached directly to `document.body`

`createComponent` gives you that control.

## One-sentence definition

`createComponent` lets you create, attach, and destroy a component entirely in TypeScript — no template required.

## Mental model

```
Declarative (@if in template):   Angular creates it when condition is true
Programmatic (createComponent):  You create it, you attach it, you destroy it
```

---

## Why attach to `document.body`?

Modals, sheets, toasts, tooltips need to sit **above everything** visually. If they live inside a component that has `overflow: hidden` or a low `z-index`, they get clipped.

Attaching to `body` escapes the CSS containment of all parent components.

```
<body>
  <app-root>              ← your whole app lives here
    <app-home> ... </app-home>
  </app-root>

  <app-task-sheet />      ← injected by SheetService, outside app-root
</body>
```

This is exactly how Angular Material's `MatDialog` works under the hood.

---

## The three steps — always in this order

```
create → attach → append
```

### 1. `createComponent()` — create in memory

```typescript
this.sheetRef = createComponent(TaskSheet, {
  environmentInjector: this.injector,
});
```

Component exists in memory. Not in the DOM yet.
`environmentInjector` = "I trust this guy, give him access to all app services."
Without it, `inject(DumpFacade)` inside `TaskSheet` would fail.

### 2. `appRef.attachView()` — tell Angular to watch it

```typescript
this.appRef.attachView(this.sheetRef.hostView);
```

Registers the component with Angular's change detection.
Without this, signals and bindings inside the component won't update.

### 3. `appendChild()` — put it in the DOM

```typescript
document.body.appendChild(this.sheetRef.location.nativeElement);
```

`location.nativeElement` = the raw DOM node Angular created.
Now it's visible on screen.

---

## Destroy — reverse order

```typescript
this.appRef.detachView(this.sheetRef.hostView);  // stop watching
this.sheetRef.destroy();                          // remove from DOM + cleanup
this.sheetRef = null;                             // release reference
```

Always store the `ComponentRef` — you need it to destroy the exact instance you created. Without it you leak the component.

---

## Wiring outputs

When a component lives in a template, Angular wires outputs automatically via `(closed)="..."`.
With `createComponent`, you subscribe manually:

```typescript
this.sheetRef.instance.closed.subscribe(() => this.close());
this.sheetRef.instance.taskAdded.subscribe(({ title, category }) => {
  this.facade.addTask(title, category);
});
```

`instance` = the component class instance. You access inputs, outputs, and methods directly on it.

---

## `environmentInjector` vs custom `Injector`

| | Use when |
|---|---|
| `environmentInjector` | your own app, component needs real services |
| custom `Injector` | building a library, passing data tokens, overriding services for tests |

```typescript
// custom injector — passing data into a dialog from outside
const injector = Injector.create({
  providers: [{ provide: DIALOG_DATA, useValue: { message: 'Are you sure?' } }],
  parent: this.injector
});
createComponent(ConfirmDialog, { environmentInjector: injector });
```

---

## Real usage in this app — `SheetService`

```typescript
@Injectable({ providedIn: 'root' })
export class SheetService {
  private appRef   = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private facade   = inject(DumpFacade);
  private sheetRef: ComponentRef<TaskSheet> | null = null;

  open() {
    if (this.sheetRef) return;                        // guard: don't open twice

    this.sheetRef = createComponent(TaskSheet, {      // 1. create in memory
      environmentInjector: this.injector,
    });

    this.sheetRef.instance.closed.subscribe(          // wire outputs
      () => this.close()
    );
    this.sheetRef.instance.taskAdded.subscribe(
      ({ title, category }) => this.facade.addTask(title, category)
    );

    this.appRef.attachView(this.sheetRef.hostView);   // 2. tell Angular to watch
    document.body.appendChild(                        // 3. put in DOM
      this.sheetRef.location.nativeElement
    );
  }

  close() {
    if (!this.sheetRef) return;
    this.appRef.detachView(this.sheetRef.hostView);   // stop watching
    this.sheetRef.destroy();                          // remove + cleanup
    this.sheetRef = null;
  }
}
```

---

## When to use `createComponent` vs `@if`

| | Use |
|---|---|
| `@if` in template | component only needed from one parent |
| `createComponent` | triggered from a service, HTTP call, or multiple places |
| `createComponent` | needs to live outside the component tree (modal, toast, sheet) |

## Key points to remember

- Always: create → attach → append. Destroy in reverse.
- `environmentInjector` = keycard to all app services — component only uses what it asks for
- Store `ComponentRef` — you need it to destroy what you created
- Wire outputs via `.instance.output.subscribe()` instead of template binding
- This is how Angular Material dialogs and overlays work under the hood
