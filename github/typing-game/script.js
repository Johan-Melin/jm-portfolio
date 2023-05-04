import { words } from './words.js';
const word = document.getElementById('word'),
  text = document.getElementById('text'),
  scoreEl = document.getElementById('score'),
  timeEl = document.getElementById('time'),
  endgameEl = document.getElementById('end-game-container'),
  settingsBtn = document.getElementById('settings-btn'),
  settings = document.getElementById('settings'),
  settingsForm = document.getElementById('settings-form'),
  difficultySelect = document.getElementById('difficulty'),
  instructions = document.getElementById("instructions"),
  highscoreEl = document.getElementById("highscore");

let randomWord,
  score = 0,
  time = 60,
  gameStarted = false,
  interval,
  charPos = 0,
  typed = 0,
  gameOverMessage;

let difficulty =
  localStorage.getItem('difficulty') !== null
    ? localStorage.getItem('difficulty')
    : 'medium';

difficultySelect.value = difficulty;

displayHighscores();

function displayHighscores() {
  highscoreEl.innerText = getHighscore(difficulty);
}

function getHighscore(diff) {
  return localStorage.getItem(diff) !== null ? localStorage.getItem(diff) : "0";
}

function setHighscore(diff, points) {
  localStorage.setItem(diff, points);
  displayHighscores();
}

function checkHighscore() {
  if (!getHighscore(difficulty) || score > getHighscore(difficulty)) {
    setHighscore(difficulty, score);
    gameOverMessage = "New highscore!";
  }
}

function startGame() {
  gameOverMessage = "Time is up!";
  gameStarted = true;
  instructions.innerText = "Type the following:";
  interval = setInterval(updateTime, 1000);
}

displayTime();
text.focus();

function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

function addWordToDOM() {
  randomWord = getRandomWord();
  word.innerHTML = randomWord;
}

function updateScore() {
  score++;
  scoreEl.innerHTML = score;
}

function updateTime() {
  time--;
  displayTime();
}

function displayTime() {
  timeEl.innerHTML = time + 's';

  if (time <= 0) {
    clearInterval(interval);
    gameOver();
    typed = 0;
  }
}

function gameOver() {
  text.blur();
  gameStarted = false;
  checkHighscore();
  let wpm = Math.floor(score/5);
  if (typed === 0)
    typed = 1;
  let acc = Math.floor(score/typed*100);
  endgameEl.innerHTML = `
    <h1>${gameOverMessage}</h1>
    <p>Your final score is ${score} words per minute</p>
    <p>Your accuracy was ${acc}%</p>
    <button onclick="location.reload()">Reload</button>
  `;

  endgameEl.style.display = 'flex';
}

addWordToDOM();

text.addEventListener('input', e => {
  if (!gameStarted) startGame();
  typed++;
  let insertedText = e.target.value;
  let lastChar = insertedText.charAt(insertedText.length-1);
  
  if (lastChar === randomWord.charAt(charPos)){
    charPos++;
    updateScore();
  } else {
    insertedText = insertedText.substring(0, insertedText.length-1)
    e.target.value = insertedText;
    if (difficulty === 'hard') {
      time -= 2;
    } else if (difficulty === 'medium') {
      time -= 1;
    } 
  }

  if (insertedText === randomWord) {
    addWordToDOM();
    charPos = 0;
    e.target.value = '';
  }

  displayTime();
});

settingsBtn.addEventListener('click', () => settings.classList.toggle('hide'));

settingsForm.addEventListener('change', e => {
  difficulty = e.target.value;
  localStorage.setItem('difficulty', difficulty);
  location.reload();
});
