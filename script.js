'use strict';

const quizForm = document.getElementById('quizForm');
const nicknameForm = document.getElementById('nicknameForm');
const questionInputs = ['q1', 'q2', 'q3'].map(id => document.getElementById(id));
const answerClues = ['q1Clue', 'q2Clue', 'q3Clue'].map(id => document.getElementById(id));
const answerHints = [
  '💡 Hint: Na un kuda erutha atha athigama panuva, day without complete. You can do it! 🧮',
  '💡 Hint: unaku enaku, then Prakash ku mattum theriyum. 🗼',
  '💡 Hint: Neeyum panuva, nanum panuva Rendu peruku pudicha work or habit (unaku venuma nee kepa, ethuku yosi). Think in English (end with “ing”). ☀️'
];
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const securityModal = document.getElementById('securityModal');
const nicknameAnswer = document.getElementById('nicknameAnswer');
const nicknameClue = document.getElementById('nicknameClue');
const result = document.getElementById('result');
const popup = document.getElementById('popup');
const popupBox = popup.querySelector('.popupBox');
const popupText = document.getElementById('popupText');
const popupSubtext = document.getElementById('popupSubtext');
const popupIcon = document.getElementById('popupIcon');
const popupOk = document.getElementById('popupOk');
const confettiLayer = document.getElementById('confettiLayer');
let lastFocusedElement = null;

function normalize(value) {
  return value.trim().toLocaleLowerCase();
}

function updateProgress() {
  const answered = questionInputs.filter(input => input.value.trim() !== '').length;
  progressText.textContent = `${answered} of 3 answered`;
  progressBar.style.width = `${(answered / questionInputs.length) * 100}%`;
}

questionInputs.forEach((input, index) => input.addEventListener('input', () => {
  updateProgress();
  input.classList.remove('wrong-answer');
  input.removeAttribute('aria-invalid');
  if (input.value.trim()) answerClues[index].classList.remove('visible');
}));

quizForm.addEventListener('submit', event => {
  event.preventDefault();
  const answers = questionInputs.map(input => normalize(input.value));
  const acceptedAnswers = [
    ['smile', 'smiling'],
    ['nithya ai', 'nithyaai', 'ai'],
    ['eat', 'eating', 'Saapda']
  ];
  let firstWrong = -1;

  questionInputs.forEach((input, index) => {
    const isCorrect = acceptedAnswers[index].includes(answers[index]);
    answerClues[index].classList.remove('visible', 'is-correct');
    input.classList.toggle('wrong-answer', !isCorrect);
    if (!isCorrect) {
      answerClues[index].textContent = answerHints[index];
      answerClues[index].classList.add('visible');
      input.setAttribute('aria-invalid', 'true');
      if (firstWrong === -1) firstWrong = index;
    } else {
      input.removeAttribute('aria-invalid');
      answerClues[index].textContent = '✨ Correct answer! Nice one!';
      answerClues[index].classList.add('visible', 'is-correct');
    }
  });

  if (firstWrong === -1) {
    openDialog(securityModal);
    nicknameAnswer.focus({ preventScroll: true });
  } else {
    questionInputs[firstWrong].focus({ preventScroll: true });
    showPopup('Almost there! 💗', 'error', 'Check the pink hints under each answer and try again.', '🌸');
  }
});

nicknameForm.addEventListener('submit', event => {
  event.preventDefault();
  const answer = normalize(nicknameAnswer.value);

  if (answer === 'kozhiii' || answer === 'feeziii') {
    closeDialog(securityModal);
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showPopup('😎🔥 Epudra Macha nee Adipoli 🔥😎', 'success', 'You passed every level. Your secret surprise is waiting!', '🎉');
    launchConfetti();
  } else {
    nicknameClue.textContent = '💡 Rendu answers irukku — start with K or F, end with iii.';
    nicknameAnswer.setAttribute('aria-invalid', 'true');
    nicknameAnswer.classList.remove('shake');
    // Force a reflow so the shake animation can replay on each wrong attempt.
    void nicknameAnswer.offsetWidth;
    nicknameAnswer.classList.add('shake');
  }
});

function openDialog(dialog) {
  lastFocusedElement = document.activeElement;
  dialog.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeDialog(dialog) {
  dialog.hidden = true;
  if (securityModal.hidden && popup.hidden) document.body.style.overflow = '';
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus({ preventScroll: true });
  }
}

function showPopup(message, type, subtext = '', icon = '✨') {
  popupBox.classList.remove('success', 'error');
  popupBox.classList.add(type);
  popupText.textContent = message;
  popupSubtext.textContent = subtext;
  popupIcon.textContent = icon;
  openDialog(popup);
  popupOk.focus({ preventScroll: true });
}

function closePopup() {
  popup.hidden = true;
  if (securityModal.hidden) document.body.style.overflow = '';
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus({ preventScroll: true });
  }
}

popupOk.addEventListener('click', closePopup);
document.querySelectorAll('[data-close]').forEach(button => {
  button.addEventListener('click', () => closeDialog(document.getElementById(button.dataset.close)));
});

// Close a visible dialog with Escape, and allow the backdrop to dismiss it.
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (!popup.hidden) closePopup();
    else if (!securityModal.hidden) closeDialog(securityModal);
  }
});
[securityModal, popup].forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      if (dialog === popup) closePopup();
      else closeDialog(dialog);
    }
  });
});

function launchConfetti() {
  const pieces = 70;
  const colors = ['#ff78c8', '#9a82ff', '#85f4d2', '#ffe08a', '#ffffff'];
  for (let i = 0; i < pieces; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--duration', `${2.1 + Math.random() * 2.2}s`);
    piece.style.setProperty('--rotation', `${Math.random() * 180}deg`);
    piece.style.setProperty('--drift', `${Math.random() * 180 - 90}px`);
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    confettiLayer.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove(), { once: true });
  }
}

// A small reusable shake animation for an incorrect nickname.
const shakeStyle = document.createElement('style');
shakeStyle.textContent = '@keyframes input-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}.shake{animation:input-shake .35s ease}';
document.head.appendChild(shakeStyle);
