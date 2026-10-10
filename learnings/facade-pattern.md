# Facade Pattern in Angular

## What problem does it solve?

In a traditional Angular app, components end up doing too much:
- Owning state
- Calling services directly
- Handling business logic
- Rendering the UI

The bigger the app, the harder this is to maintain, test, or reuse.

## The one-sentence definition

A Facade is a service that owns a feature's **state and operations**, so components only have to render and call it.

## Mental model

```
Old:  Component (state + UI) → Service (tools)
New:  Component (UI only)    → Facade (state + orchestration) → Service (tools)
```

Component becomes a dumb renderer.
Facade becomes the brain.
Services stay as pure tools.

## Is this Angular-specific?

No. It's a general software pattern from *Design Patterns* (Gang of Four, 1994).
Same idea exists in:
- React → custom hooks + Zustand/Redux
- Vue → Pinia stores
- Angular → facade services with signals

Angular didn't invent it. No special decorator. Just a convention.

---

## Real example: Flight Search App

### Without Facade

```
FlightSearchComponent
  ├── origin, destination, dates  ← state lives here
  ├── searchResults: Flight[]     ← state lives here
  ├── callFlightAPI()             ← business logic here
  ├── filterByPrice()             ← business logic here
  └── bookFlight()                ← business logic here
```

Component is the brain. Gets fat fast. Hard to reuse, test, or change.

---

### Step 1 — split into pure tool services

```typescript
// raw HTTP only, no state, no opinion
@Injectable({ providedIn: 'root' })
export class FlightApiService {
  getFlightOffers(params: SearchParams): Observable<Flight[]> { ... }
  bookFlight(flight: Flight): Observable<Booking> { ... }
}

@Injectable({ providedIn: 'root' })
export class HotelApiService {
  getHotelOffers(params: SearchParams): Observable<Hotel[]> { ... }
}

@Injectable({ providedIn: 'root' })
export class UserService {
  currentUser = signal<User | null>(null);
}
```

These are tools. In/out. No state, no side effects beyond their own job.

---

### Step 2 — Facade owns state and orchestrates

```typescript
@Injectable({ providedIn: 'root' })
export class TravelFacade {

  // state — signals live here, not in components
  flights    = signal<Flight[]>([]);
  hotels     = signal<Hotel[]>([]);
  isLoading  = signal(false);
  searchParams = signal<SearchParams | null>(null);

  // inject the tool services
  private flightApi = inject(FlightApiService);
  private hotelApi  = inject(HotelApiService);
  private userSvc   = inject(UserService);

  // operations — components call these, don't know what happens inside
  search(params: SearchParams) {
    this.searchParams.set(params);
    this.isLoading.set(true);

    // calls both APIs, updates signals when done
    this.flightApi.getFlightOffers(params).subscribe(results => {
      this.flights.set(results);
      this.isLoading.set(false);
    });
  }

  book(flight: Flight) {
    const user = this.userSvc.currentUser();
    if (!user) return;                         // auth check here, not in component
    this.flightApi.bookFlight(flight).subscribe(...);
  }

  clearSearch() {
    this.flights.set([]);
    this.searchParams.set(null);
  }
}
```

---

### Step 3 — Components become thin renderers

```typescript
// FlightSearchComponent
facade = inject(TravelFacade);

// template reads signals, calls facade methods
// <app-flight-card *ngFor="let f of facade.flights()" (book)="facade.book(f)" />
```

```typescript
// BookingConfirmComponent — also uses the same facade
facade = inject(TravelFacade);
// facade.book(flight) — same method, same state, no duplication
```

No component knows about `FlightApiService`.
No component owns state.
If Skyscanner replaces Amadeus tomorrow → **zero component changes**.

---

## The call flow — booking a flight

```
User clicks "Book"
  → Component calls facade.book(flight)
  → Facade checks auth via UserService
  → Facade calls FlightApiService.bookFlight()
  → Facade updates signals (booking confirmed, loading done)
  → Component sees signal change, re-renders automatically
  → Component never knew any of that happened
```

---

## Why bother?

| Without Facade | With Facade |
|---|---|
| Logic scattered in components | Logic in one place |
| Hard to test (UI + logic tangled) | Facade testable without any UI |
| Add a new screen → duplicate logic | New screen just injects the facade |
| Change API → touch every component | Change only the facade |

## Syntax — same as any Angular service

```typescript
@Injectable({ providedIn: 'root' })
export class DumpFacade { }
```

Same decorator. Same `inject()`. The difference is what goes inside, not how it's declared.

## Key points to remember

- Facade = service with state + operations for one feature
- Components only render and delegate — they never own state
- Services = pure tools (HTTP, utilities) — no state
- The pattern is not Angular-specific — it's a general design principle
- No special Angular syntax — just a naming convention and intent

## One-sentence explanation

A Facade is a service that owns a feature's state and exposes a simple API so components only need to render and call it.
