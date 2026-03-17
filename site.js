(async () => {
  // api info
  const RAWG_API_KEY = "4d31007b922d47a1ac928bf15108b52d";
  let searchTimeout = null;
  let selectedRawgGameId = null;
  let selectedCoverUrl = "";

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

    const total = Math.round(((graphics + gameplay + story + visual + vibe + replay) / 50)*90);
    totalScore.textContent = total;
  }

  // рендер игр на страничке
  function renderGames() {
    const gameList = document.getElementById("gameList") || document.getElementById("gamesList");
    if (!gameList) return;

    gameList.innerHTML = "";

    if (games.length === 0) {
      gameList.innerHTML = "<p>Пока нет сохранённых игр.</p>";
      return;
    }

    [...games].reverse().forEach((game, reverseIndex) => {
      const realIndex = games.length - 1 - reverseIndex;

      const card = document.createElement("div");
      card.className = "saved-card";

      card.innerHTML = `
      ${game.coverImage ? `<div class="saved-cover" style="background-image: url('${game.coverImage}');"></div>` : ""}
      <div class="saved-card-top">
          <div>
          <h4>${game.name}</h4>
          <div class="saved-meta">${game.studio || "Без студии"}</div>
          </div>
          <div class="saved-score">${game.total}/90</div>
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

    const total = Math.round(((graphics + gameplay + story + visual + vibe + replay) / 50)*90);

   
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
      rawgId: selectedRawgGameId
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

      selectedRawgGameId = null;
      selectedCoverUrl = "";

    setCoverImage("");
    hideDropdown();
    updateTotal();

    if (showAlert) {
      alert("Форма сброшена.");
    }
  }

  // api search функционалл 

  async function searchGamesRAWG(query) {
    const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=5`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Ошибка при поиске игр");
    }

    const data = await response.json();
    return data.results || [];
  }

  async function fetchGameDetailsRAWG(gameId) {
    const url = `https://api.rawg.io/api/games/${gameId}?key=${RAWG_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Ошибка при получении данных игры");
    }

    return await response.json();
  }

  function getStudioName(gameDetails) {
    if (gameDetails.developers && gameDetails.developers.length > 0) {
      return gameDetails.developers.map(dev => dev.name).join(", ");
    }

    if (gameDetails.publishers && gameDetails.publishers.length > 0) {
      return gameDetails.publishers.map(pub => pub.name).join(", ");
    }

    return "";
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

  function hideDropdown() {
    const dropdown = document.getElementById("gameDropdown");
    if (!dropdown) return;
    dropdown.style.display = "none";
    dropdown.innerHTML = "";
  }

  function renderDropdown(games) {
    const dropdown = document.getElementById("gameDropdown");
    if (!dropdown) return;

    dropdown.innerHTML = "";

    if (!games.length) {
      hideDropdown();
      return;
    }

    games.forEach(game => {
      const option = document.createElement("div");
      option.className = "game-option";

      const releasedText = game.released ? `Релиз: ${game.released}` : "Дата неизвестна";
      const image = game.background_image || "";

      option.innerHTML = `
        <img src="${image}" alt="${game.name}">
        <div>
          <div class="game-option-title">${game.name}</div>
          <div class="game-option-subtitle">${releasedText}</div>
        </div>
      `;

      option.addEventListener("click", async () => {
        try {
          const details = await fetchGameDetailsRAWG(game.id);

          selectedRawgGameId = details.id;

          const gameNameInput = document.getElementById("gameName");
          const studioInput = document.getElementById("gameStudio");

          if (gameNameInput) gameNameInput.value = details.name || "";
          if (studioInput) studioInput.value = getStudioName(details);

          selectedCoverUrl = details.background_image || game.background_image || "";
          setCoverImage(selectedCoverUrl)
          hideDropdown();
        } catch (error) {
          console.error(error);
          hideDropdown();
        }
      });

      dropdown.appendChild(option);
    });

    dropdown.style.display = "block";
  }

  function initRawgAutocomplete() {
    const gameNameInput = document.getElementById("gameName");
    const dropdown = document.getElementById("gameDropdown");

    if (!gameNameInput || !dropdown) return;

    gameNameInput.addEventListener("input", () => {
      const query = gameNameInput.value.trim();

      selectedRawgGameId = null;

      clearTimeout(searchTimeout);

      if (query.length < 2) {
        hideDropdown();
        return;
      }

      searchTimeout = setTimeout(async () => {
        try {
          const games = await searchGamesRAWG(query);
          renderDropdown(games);
        } catch (error) {
          console.error(error);
          hideDropdown();
        }
      }, 300);
    });

    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target) && event.target !== gameNameInput) {
        hideDropdown();
      }
    });
  }

  // init
  document.addEventListener("DOMContentLoaded", function () {
    // Для index.html
    setupSlider("graphics", "graphicsValue", "miniGraphics");
    setupSlider("gameplay", "gameplayValue", "miniGameplay");
    setupSlider("story", "storyValue", "miniStory");
    setupSlider("visual", "visualValue", "miniVisual");
    setupSlider("vibe", "vibeValue", "miniVibe");
    setupSlider("replay", "replayValue", "miniReplay");

    initRawgAutocomplete();
    updateTotal();
    renderGames();
  });

  window.addGame = addGame;
  window.clearAllGames = clearAllGames;
  window.deleteGame = deleteGame;
  window.resetForm = resetForm;

})()