(async () => {
  let searchTimeout = null;
  let selectedGameId = null;
  let selectedCoverUrl = "";
  let currentSort = "rating-desc";

  let games = JSON.parse(localStorage.getItem("gamesFancy")) || [];

  // local storage - сохран игр
  function saveGames() {
    localStorage.setItem("gamesFancy", JSON.stringify(games));
  }

  // слайдеры + подсчёт
  function setupSlider(sliderId, valueId, miniId) {
    const slider = document.getElementById(sliderId);
    const valueText = document.getElementById(valueId);
    const miniText = document.getElementById(miniId);

    if (!slider || !valueText || !miniText) return;

    function update() {
      valueText.textContent = slider.value;
      miniText.textContent = slider.value;
      updateTotal();
    }

    slider.addEventListener("input", update);
    update();
  }

  function updateTotal() {
    const totalScore = document.getElementById("totalScore");
    if (!totalScore) return;

    const graphics = Number(document.getElementById("graphics")?.value || 0);
    const gameplay = Number(document.getElementById("gameplay")?.value || 0);
    const story = Number(document.getElementById("story")?.value || 0);
    const visual = Number(document.getElementById("visual")?.value || 0);
    const vibe = Number(document.getElementById("vibe")?.value || 0);
    const replay = Number(document.getElementById("replay")?.value || 0);

    const total = Math.round(((graphics + gameplay + story + visual + vibe + replay) / 50) * 90);
    const style = getScoreStyle(total);

    totalScore.textContent = total;
    totalScore.style.color = style.color;
    totalScore.style.textShadow = style.shadow;
  }

  // Цвет Оценок
  function getScoreStyle(score) {
    if (score <= 30) {
      return {
        color: "#6b7280",
        shadow: "none"
      };
    }

    if (score <= 60) {
      return {
        color: "#5c7cff",
        shadow: "0 0 10px rgba(92,124,255,0.4)"
      };
    }

    if (score <= 80) {
      return {
        color: "#b15cff",
        shadow: "0 0 14px rgba(177,92,255,0.5)"
      };
    }

    return {
      color: "#ff2f87",
      shadow: "0 0 18px rgba(255,47,135,0.7)"
    };
  }

  // сортировка
  function sortGamesList(list) {
    const sorted = [...list];

    if (currentSort === "rating-desc") {
      sorted.sort((a, b) => (b.total || 0) - (a.total || 0));
    } else if (currentSort === "rating-asc") {
      sorted.sort((a, b) => (a.total || 0) - (b.total || 0));
    } else if (currentSort === "name-asc") {
      sorted.sort((a, b) =>
        (a.name || "").localeCompare((b.name || ""), undefined, {
          numeric: true,
          sensitivity: "base"
        })
      );
    } else if (currentSort === "name-desc") {
      sorted.sort((a, b) =>
        (b.name || "").localeCompare((a.name || ""), undefined, {
          numeric: true,
          sensitivity: "base"
        })
      );
    }

    return sorted;
  }

  // рендер игр на страничке
  function renderGames() {
    const gameList = document.getElementById("gameList") || document.getElementById("gamesList");
    if (!gameList) return;

    const searchInput = document.getElementById("gamesSearch");
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";

    gameList.innerHTML = "";

    if (games.length === 0) {
      gameList.innerHTML = "<p>Пока нет сохранённых игр.</p>";
      return;
    }

    const filteredGames = [...games].filter((game) => {
      const name = (game.name || "").toLowerCase();
      const studio = (game.studio || "").toLowerCase();
      const comment = (game.comment || "").toLowerCase();

      return (
        name.includes(searchValue) ||
        studio.includes(searchValue) ||
        comment.includes(searchValue)
      );
    });

    if (filteredGames.length === 0) {
      gameList.innerHTML = `<div class="no-results">Ничего не найдено.</div>`;
      return;
    }

    const finalGames = sortGamesList(filteredGames);

    finalGames.forEach((game) => {
      const realIndex = games.findIndex((g) => g === game);

      const card = document.createElement("div");
      card.className = "saved-card";

      const style = getScoreStyle(game.total);

      card.innerHTML = `
        ${game.coverImage ? `<div class="saved-cover" style="background-image: url('${game.coverImage}');"></div>` : ""}

        <div class="saved-card-top">
          <div>
            <h4>${game.name}</h4>
            <div class="saved-meta">${game.studio || "Без студии"}</div>
          </div>
          <div class="saved-score" style="color:${style.color}; text-shadow:${style.shadow}">
            ${game.total}/90
          </div>
        </div>

        <div class="saved-stats">
          <span>Графика: ${game.graphics}</span>
          <span>Геймплей: ${game.gameplay}</span>
          <span>Сюжет: ${game.story}</span>
          <span>Визуал: ${game.visual}</span>
          <span>Вайб: ${game.vibe}</span>
          <span>Играбельность: ${game.replay}</span>
        </div>

        <div class="saved-comment">${game.comment || "Без комментария"}</div>

        <div class="saved-actions">
          <button class="danger-btn" onclick="deleteGame(${realIndex})">Удалить</button>
        </div>
      `;

      gameList.appendChild(card);
    });
  }

  // кнопка добавить, очистить, удалить
  function addGame() {
    const nameInput = document.getElementById("gameName");
    if (!nameInput) return;

    const name = nameInput.value.trim();
    const studio = document.getElementById("gameStudio")?.value.trim() || "";
    const comment = document.getElementById("gameComment")?.value.trim() || "";

    const graphics = Number(document.getElementById("graphics")?.value || 0);
    const gameplay = Number(document.getElementById("gameplay")?.value || 0);
    const story = Number(document.getElementById("story")?.value || 0);
    const visual = Number(document.getElementById("visual")?.value || 0);
    const vibe = Number(document.getElementById("vibe")?.value || 0);
    const replay = Number(document.getElementById("replay")?.value || 0);

    const total = Math.round(((graphics + gameplay + story + visual + vibe + replay) / 50) * 90);
    const coverImage = selectedCoverUrl;

    if (!name) {
      alert("Введите название игры.");
      return;
    }

    const game = {
      name,
      studio,
      comment,
      graphics,
      gameplay,
      story,
      visual,
      vibe,
      replay,
      total,
      coverImage,
      gameId: selectedGameId
    };

    games.push(game);
    saveGames();
    renderGames();
    resetForm(false);
  }

  function deleteGame(index) {
    games.splice(index, 1);
    saveGames();
    renderGames();
  }

  function clearAllGames() {
    if (!confirm("Удалить все сохранённые игры?")) return;
    games = [];
    saveGames();
    renderGames();
  }

  // ресет всего
  function resetForm(showAlert = false) {
    const gameName = document.getElementById("gameName");
    if (!gameName) return;

    document.getElementById("gameName").value = "";
    document.getElementById("gameStudio").value = "";
    document.getElementById("gameComment").value = "";

    document.getElementById("graphics").value = 5;
    document.getElementById("gameplay").value = 5;
    document.getElementById("story").value = 5;
    document.getElementById("visual").value = 5;
    document.getElementById("vibe").value = 3;
    document.getElementById("replay").value = 3;

    document.getElementById("graphicsValue").textContent = 5;
    document.getElementById("gameplayValue").textContent = 5;
    document.getElementById("storyValue").textContent = 5;
    document.getElementById("visualValue").textContent = 5;
    document.getElementById("vibeValue").textContent = 3;
    document.getElementById("replayValue").textContent = 3;

    document.getElementById("miniGraphics").textContent = 5;
    document.getElementById("miniGameplay").textContent = 5;
    document.getElementById("miniStory").textContent = 5;
    document.getElementById("miniVisual").textContent = 5;
    document.getElementById("miniVibe").textContent = 3;
    document.getElementById("miniReplay").textContent = 3;

    selectedGameId = null;
    selectedCoverUrl = "";

    setCoverImage("");
    hideDropdown();
    updateTotal();

    if (showAlert) {
      alert("Форма сброшена.");
    }
  }

  // IGDB API
  async function searchGamesIGDB(query) {
    const response = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error("Ошибка при поиске игр");
    }

    return await response.json();
  }

  function getStudioName(game) {
    if (!game.involved_companies || !game.involved_companies.length) {
      return "";
    }

    const developer = game.involved_companies.find(
      (item) => item.developer && item.company?.name
    );

    if (developer) {
      return developer.company.name;
    }

    const publisher = game.involved_companies.find(
      (item) => item.publisher && item.company?.name
    );

    if (publisher) {
      return publisher.company.name;
    }

    const firstCompany = game.involved_companies.find(
      (item) => item.company?.name
    );

    return firstCompany ? firstCompany.company.name : "";
  }

  function getIGDBImage(imageId) {
    return `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${imageId}.jpg`;
  }

  function setCoverImage(imageUrl) {
    const cover = document.querySelector(".cover");
    if (!cover) return;

    if (imageUrl) {
      cover.style.backgroundImage = `url("${imageUrl}")`;
      cover.classList.add("has-image");
      cover.textContent = "";
    } else {
      cover.style.backgroundImage = "";
      cover.classList.remove("has-image");
      cover.textContent = "🎮";
    }
  }

  const dropdown = document.createElement("div");
  dropdown.id = "gameDropdown";
  dropdown.className = "game-dropdown";
  document.body.appendChild(dropdown);

  function hideDropdown() {
    const dropdown = document.getElementById("gameDropdown");
    if (!dropdown) return;
    dropdown.style.display = "none";
    dropdown.innerHTML = "";
  }

  function positionDropdown(input) {
  const rect = input.getBoundingClientRect();

  dropdown.style.top = rect.bottom + window.scrollY + 8 + "px";
  dropdown.style.left = rect.left + window.scrollX + "px";
  dropdown.style.width = rect.width + "px";
}

  function renderDropdown(games) {
  dropdown.innerHTML = "";

  if (!games.length) {
    hideDropdown();
    return;
  }

  games.forEach(game => {
    const option = document.createElement("div");
    option.className = "game-option";

    const image = game.cover?.image_id
      ? getIGDBImage(game.cover.image_id)
      : "";

    const studio = getStudioName(game);

    option.innerHTML = `
      ${image ? `<img src="${image}" alt="${game.name}">` : `<div class="dropdown-no-image">🎮</div>`}
      <div>
        <div class="game-option-title">${game.name}</div>
        <div class="game-option-subtitle">${studio || "Студия неизвестна"}</div>
      </div>
    `;

    option.onclick = () => {
      selectedGameId = game.id;

      const gameNameInput = document.getElementById("gameName");
      const studioInput = document.getElementById("gameStudio");

      if (gameNameInput) gameNameInput.value = game.name || "";
      if (studioInput) studioInput.value = studio || "";

      selectedCoverUrl = image;
      setCoverImage(image);
      hideDropdown();
    };

    dropdown.appendChild(option);
  });

  dropdown.style.display = "block";
}

  function initAutocomplete() {
  const input = document.getElementById("gameName");

  if (!input) return;

  input.addEventListener("input", () => {
    const query = input.value.trim();

    selectedGameId = null;
    clearTimeout(searchTimeout);

    if (query.length === 0) {
      selectedCoverUrl = "";
      const studioInput = document.getElementById("gameStudio");
      if (studioInput) studioInput.value = "";
      setCoverImage("");
      hideDropdown();
      return;
    }

    if (query.length < 2) {
      hideDropdown();
      return;
    }

    positionDropdown(input);

    searchTimeout = setTimeout(async () => {
      try {
        const games = await searchGamesIGDB(query);
        renderDropdown(games);
      } catch (error) {
        console.error(error);
        hideDropdown();
      }
    }, 300);
  });

  window.addEventListener("scroll", () => positionDropdown(input));
  window.addEventListener("resize", () => positionDropdown(input));

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target) && event.target !== input) {
      hideDropdown();
    }
  });
}

    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target) && event.target !== input) {
        hideDropdown();
      }
    });
  }

  function initSorting() {
    const sortToggle = document.getElementById("sortToggle");
    const sortMenu = document.getElementById("sortMenu");
    const sortOptions = document.querySelectorAll(".sort-option");

    if (sortToggle && sortMenu) {
      sortToggle.addEventListener("click", () => {
        sortMenu.classList.toggle("open");
      });

      document.addEventListener("click", (event) => {
        if (!sortMenu.contains(event.target) && event.target !== sortToggle) {
          sortMenu.classList.remove("open");
        }
      });
    }

    sortOptions.forEach((option) => {
      option.addEventListener("click", () => {
        currentSort = option.dataset.sort;

        sortOptions.forEach((btn) => btn.classList.remove("active"));
        option.classList.add("active");

        if (sortToggle) {
          sortToggle.textContent = option.textContent;
        }

        if (sortMenu) {
          sortMenu.classList.remove("open");
        }

        renderGames();
      });
    });
  }

  // init
  document.addEventListener("DOMContentLoaded", function () {
    setupSlider("graphics", "graphicsValue", "miniGraphics");
    setupSlider("gameplay", "gameplayValue", "miniGameplay");
    setupSlider("story", "storyValue", "miniStory");
    setupSlider("visual", "visualValue", "miniVisual");
    setupSlider("vibe", "vibeValue", "miniVibe");
    setupSlider("replay", "replayValue", "miniReplay");

    initAutocomplete();
    initSorting();
    updateTotal();
    renderGames();

    const gamesSearch = document.getElementById("gamesSearch");
    if (gamesSearch) {
      gamesSearch.addEventListener("input", renderGames);
    }
  });

  window.addGame = addGame;
  window.clearAllGames = clearAllGames;
  window.deleteGame = deleteGame;
  window.resetForm = resetForm;
})();