
const map = L.map('map', { zoomControl: true }).setView([13.0827, 80.2707], 15);

L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { maxZoom: 19, attribution: 'Tiles © Esri' }
).addTo(map);


const drone = L.marker([13.0827, 80.2707]).addTo(map);


new ResizeObserver(() => map.invalidateSize()).observe(document.getElementById('map'));


// search location


const searchInput = document.getElementById("locationSearch");
const searchResults = document.getElementById("searchResults");
const clearSearch = document.getElementById("clearSearch");

let searchTimeout;
let activeSearchController;

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);

  const query = searchInput.value.trim();

  if (query.length < 3) {
    searchResults.innerHTML = "";
    searchResults.classList.remove("show");
    return;
  }

  searchResults.innerHTML =
    '<div class="search-message">Searching locations...</div>';
  searchResults.classList.add("show");

  searchTimeout = setTimeout(() => {
    searchLocations(query);
  }, 600);
});

async function searchLocations(query) {
  if (activeSearchController) {
    activeSearchController.abort();
  }

  activeSearchController = new AbortController();

  try {
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      limit: "5",
      addressdetails: "1"
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        signal: activeSearchController.signal,
        headers: {
          Accept: "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error("Location search failed");
    }

    const locations = await response.json();

    searchResults.innerHTML = "";

    if (locations.length === 0) {
      searchResults.innerHTML =
        '<div class="search-message">No locations found.</div>';
      searchResults.classList.add("show");
      return;
    }

    locations.forEach(location => {
      const result = document.createElement("div");
      result.className = "search-result";
      result.textContent = location.display_name;

      result.addEventListener("click", () => {
        const lat = Number(location.lat);
        const lng = Number(location.lon);



        drone.setLatLng([lat, lng]);

        map.flyTo([lat, lng], 16, {
          animate: true,
          duration: 1.2
        });

        searchInput.value = location.display_name;
        searchResults.classList.remove("show");

        L.popup()
          .setLatLng([lat, lng])
          .setContent(location.display_name)
          .openOn(map);
      });

      searchResults.appendChild(result);
    });

    searchResults.classList.add("show");

  } catch (error) {
    if (error.name === "AbortError") return;

    searchResults.innerHTML =
      '<div class="search-message">' +
      'Unable to search. Check your internet connection.' +
      '</div>';

    searchResults.classList.add("show");
  }
}

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  searchResults.innerHTML = "";
  searchResults.classList.remove("show");
  searchInput.focus();
});

document.addEventListener("click", event => {
  if (!event.target.closest(".map-search")) {
    searchResults.classList.remove("show");
  }
});

searchInput.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    searchResults.classList.remove("show");
  }

});


const coord = document.querySelector(".coord-info");

function updateCoordinates() {
  const center = map.getCenter();
  const zoom = map.getZoom();

  coord.innerHTML = `
        Lat: ${center.lat.toFixed(6)}
        &nbsp; Lon: ${center.lng.toFixed(6)}
        &nbsp; | &nbsp; Zoom: ${zoom}
    `;
}

map.on("move", updateCoordinates);

map.on("zoomend", updateCoordinates);

updateCoordinates();



