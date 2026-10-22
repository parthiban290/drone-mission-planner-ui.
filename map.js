
const map = L.map('map', { zoomControl: true }).setView([13.0827, 80.2707], 15);

L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { maxZoom: 19, attribution: 'Tiles © Esri' }
).addTo(map);


const drone = L.marker([13.0827, 80.2707]).addTo(map);


new ResizeObserver(() => map.invalidateSize()).observe(document.getElementById('map'));
