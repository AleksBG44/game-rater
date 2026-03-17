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
    total
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

  updateTotal();

  if (showAlert) {
    alert("Форма сброшена.");
  }
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

  updateTotal();
  renderGames();
});