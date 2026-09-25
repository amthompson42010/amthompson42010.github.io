// Non-building categories to hide when isolating a single floor (they aren't
// tied to one story and would just clutter/obscure the floor being viewed).
// Same exclusion list used throughout the Pro-side pipeline (step52/step58)
// for per-floor definition queries.
export const HIDE_CATEGORIES = [
  "Topography",
  "Site",
  "Mass",
  "Parking",
  "Roads",
  "Hardscape",
  "Planting",
  "Entourage",
];
