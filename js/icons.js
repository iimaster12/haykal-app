// Stroke icons on a 24 px grid. Drawn for this app; no icon font needed.
const P = {
  building: '<path d="M4 21V5l8-2v18M12 21V8l8 2v11M3 21h18"/><path d="M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/>',
  house: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  lab: '<path d="M3 15h18M6 15v-4h12v4"/><path d="M10 11V4h4v7"/><path d="M5 19h14" stroke-dasharray="2 2"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/><path d="m3 17.5 9 4.5 9-4.5" opacity=".55"/>',
  xray: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M9 7v10M12 7v10M15 7v10M8 10h8M8 14h8"/>',
  section: '<path d="M4 6h16v12H4z" opacity=".5"/><path d="M2 12h20" stroke-dasharray="3 2"/><path d="m18 9 3 3-3 3"/>',
  explode: '<path d="M5 4h14v4H5zM5 16h14v4H5z"/><path d="M12 9v6M9.5 11 12 8.5 14.5 11M9.5 13 12 15.5 14.5 13"/>',
  loads: '<path d="M12 3v13"/><path d="m7 11 5 5 5-5"/><path d="M4 21h16"/><path d="M7 21v-2M12 21v-2M17 21v-2"/>',
  build: '<path d="M4 20h16"/><path d="M6 20v-5h4v5M14 20V8h4v12"/><path d="M6 11h4M14 4h4"/>',
  foundation: '<path d="M10 3h4v8h-4z"/><path d="M4 11h16v5H4z"/><path d="M2 20h20" stroke-dasharray="2 2"/>',
  quiz: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6" fill="currentColor"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
  theme: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  inside: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="M12 12 4 7.5M12 12l8-4.5M12 12v9" opacity=".5"/><circle cx="12" cy="12" r="2.2"/>',
  focus: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/><circle cx="12" cy="12" r="2.5"/>',
  play: '<path d="M7 5v14l11-7Z" fill="currentColor"/>',
  pause: '<path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor"/>',
  prev: '<path d="m15 6-6 6 6 6"/>',
  next: '<path d="m9 6 6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check: '<path d="m5 12 4 4 10-10"/>',
  download: '<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>',
  alert: '<path d="M12 4 2.5 20h19Z"/><path d="M12 10v4M12 17v.5"/>',
  crack: '<path d="M4 4h16v16H4z" opacity=".45"/><path d="m13 4-2.5 5 3 2.5-3.5 4 1.5 4.5"/><path d="m11.5 15.5-3 1.5"/>',
  guide: '<path d="M5 4h9a5 5 0 0 1 5 5v11H10a5 5 0 0 1-5-5Z"/><path d="M9 9h6M9 13h4"/>',
};

export function icon(name, cls = '') {
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}
