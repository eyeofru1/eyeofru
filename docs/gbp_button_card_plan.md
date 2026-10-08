# Plan: Adding Google Business Profile (GBP) Action Button Within Lead Cards

## Executive Summary
You are adding the function in your Google Apps Script / Lead Engine to write the verified **Google Business Profile (GBP) link** directly into your Master Sheet. 

This plan details how to seamlessly integrate a 1-tap **`GBP ↗`** action button within each **Lead Card** in the main grid view (and inside the detail drawer), giving you instant access to open the business's live Google Maps profile in a new tab without disrupting card navigation.

---

## 1. Data Schema & Robust Field Resolution

In your Google Sheet and API payloads, the GBP link will be delivered via columns such as `mapsUrl` or a newly populated `gbpUrl` / `gbpLink`. 

To ensure 100% backward and forward compatibility (even if a legacy lead doesn't have a direct CID URL yet), the card resolver will detect:

```javascript
const gbpUrl = lead.gbpUrl || 
               lead.gbpLink || 
               lead.mapsUrl || 
               lead.googleMapsUrl || 
               `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.businessName + " " + (lead.address || ""))}`;
```
* **Direct GBP Link**: Opens the exact Google Business Profile (e.g. `https://maps.google.com/?cid=...` or `https://www.google.com/maps/place/...`).
* **Fallback**: Opens a verified Google Maps place search for that business name + city.

---

## 2. Design Options: How to Display the Button Within the Card

We have evaluated three minimalist, high-velocity placements that match your Obsidian Mineral design system:

### Option A: Dedicated Card Footer Action Bar (Recommended)
Add a clean, low-profile action footer at the bottom of every card containing **`GBP ↗`** and **`Audit ↗`**:

```
┌──────────────────────────────────────────────┐
│ NEED 8/10                       Ready        │
│                                              │
│ Reliable Plumbing Services                   │
│ Orlando, FL • Plumber                        │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ GBP Health:       75 / 100               │ │
│ │ Website Score:     9 / 10 (Modern)       │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ [ 📍 GBP ↗ ]                 [ Audit ↗ ]    │
└──────────────────────────────────────────────┘
```
* **Pros**:
  * Large, comfortable tap target on mobile and desktop.
  * Clear distinction between opening external tools vs. inspecting internal CRM data.
  * Keeps the score box clean and uncluttered.

---

### Option B: Inline Quick Action in Card Header
Place a compact text pill button directly in the top header line between the `NEED` rank and the status pill:

```
┌──────────────────────────────────────────────┐
│ [NEED 8/10]        [GBP ↗]        Ready      │
│                                              │
│ Reliable Plumbing Services                   │
│ Orlando, FL • Plumber                        │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ GBP Health:       75 / 100               │ │
│ │ Website Score:     9 / 10 (Modern)       │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```
* **Pros**:
  * Saves vertical height on mobile.
  * Immediate top-line visibility.
* **Cons**:
  * Tighter horizontal space on small phone screens (iPhone SE / standard viewports) when business status text is long.

---

### Option C: Integrated Inside the "GBP Health" Score Row
Integrate a subtle, interactive `[ Maps ↗ ]` chip directly on the `GBP Health` metric row:

```
┌──────────────────────────────────────────────┐
│ NEED 8/10                       Ready        │
│                                              │
│ Reliable Plumbing Services                   │
│ Orlando, FL • Plumber                        │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ GBP Health:       75 / 100   [GBP ↗]     │ │
│ │ Website Score:     9 / 10 (Modern)       │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```
* **Pros**:
  * Visually contextualizes the link with the GBP score itself.
* **Cons**:
  * Smaller click area; may be accidentally clicked when intending to open the drawer.

---

## 3. Critical UX & Interaction Rule: Event Isolation

In the dashboard, tapping any card opens the **Lead Detail Drawer** (`onInspectLead(lead)`).
For the **GBP button**, we will apply:

```javascript
gbpBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevents the card click / drawer from triggering
  window.open(gbpUrl, "_blank", "noopener,noreferrer");
});
```
This guarantees that tapping `GBP ↗` immediately opens the Google Business Profile in a new tab without popping up the drawer over your screen.

---

## 4. Complementary Upgrade: Lead Detail Drawer Top Action Bar

In addition to the card button, we will also add **`GBP ↗`** to Row 1 of the Slide-Up Drawer:

* **Current Drawer Bar**:
  `[ Site ↗ ]` `[ Audit ↗ ]` `[ Tracker ]`
* **Upgraded Drawer Bar**:
  `[ Site ↗ ]` `[ GBP ↗ ]` `[ Audit ↗ ]` `[ Tracker ]`

This gives you a consistent, unified way to jump into Google Maps from anywhere in the app.

---

## 5. Implementation Checklist

1. **`src/js/components/leadTable.js`**:
   - Update `renderGridCard(lead)` to generate the verified `gbpUrl`.
   - Add the `btn-card-gbp` button.
   - Attach `click` handler with `e.stopPropagation()` in `bindEvents()`.
2. **`src/js/components/leadDrawer.js`**:
   - Add the `GBP ↗` link in `drawer-action-row` (Row 1).
3. **`src/css/dashboard.css`**:
   - Style the button with subtle border, obsidian dark styling, hover illumination, and crisp typography (`Geist` + `JetBrains Mono`).
4. **End-to-End Test**:
   - Test with the 5 newly sourced Orlando leads and verify links open directly to Google Maps in a new tab.
