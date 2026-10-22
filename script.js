// Select DOM elements using IDs from index.html
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");
const emptyState = document.getElementById("empty-state");
const quickPicksContainer = document.getElementById("quick-picks");

// 1. Event listener for search form submission
searchForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Stop page reload

  const query = searchInput.value.trim();

  // Task 4: Ignore empty searches
  if (!query) return;

  // Execute search
  fetchAndRenderImages(query);
});

// Task 5 (Enhancement): Handle Category / Quick-Pick chip clicks
if (quickPicksContainer) {
  quickPicksContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("chip")) {
      const selectedQuery = event.target.textContent.trim();
      searchInput.value = selectedQuery;
      fetchAndRenderImages(selectedQuery);
    }
  });
}

// 2. Fetch data from Wikimedia Commons API
async function fetchAndRenderImages(query) {
  // Construct URL with encodeURIComponent for safety
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query" +
    "&generator=search" +
    "&gsrsearch=" + encodeURIComponent(query) +
    "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*";

  try {
    const response = await fetch(url);

    // Task 2: Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if query returned any results
    if (!data.query || !data.query.pages) {
      renderNoResults(query);
      return;
    }

    const items = Object.values(data.query.pages);
    renderCards(items, query);

  } catch (error) {
    console.error("Error fetching images:", error);
    if (emptyState) {
      emptyState.style.display = "block";
      emptyState.textContent = "An error occurred while fetching images. Please try again.";
    }
  }
}

// 3. Render results into the DOM
function renderCards(items, query) {
  // Clear previous search results
  resultsContainer.innerHTML = "";

  // Hide or update empty-state message
  if (emptyState) {
    emptyState.style.display = "block";
    emptyState.textContent = `Showing ${items.length} results for "${query}"`;
  }

  // Loop over items and create DOM elements
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";

    const img = document.createElement("img");
    const imageInfo = item.imageinfo ? item.imageinfo[0] : null;
    
    // Set fallback image source if thumbnail isn't available
    img.src = imageInfo ? imageInfo.thumburl : "https://via.placeholder.com/300";
    img.alt = item.title;

    // Clean up title (remove "File:" prefix)
    const caption = document.createElement("p");
    caption.textContent = item.title.replace(/^File:/, "");

    // Enhancement: Click image card to open full image in new tab
    if (imageInfo && imageInfo.url) {
      const link = document.createElement("a");
      link.href = imageInfo.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.appendChild(img);
      card.appendChild(link);
    } else {
      card.appendChild(img);
    }

    card.appendChild(caption);
    resultsContainer.appendChild(card);
  });
}

// Helper function for zero-result queries
function renderNoResults(query) {
  resultsContainer.innerHTML = "";
  if (emptyState) {
    emptyState.style.display = "block";
    emptyState.textContent = `No results found for "${query}". Try another search term.`;
  }
}