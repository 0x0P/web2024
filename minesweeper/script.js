const width = 10; // 보드의 가로 크기
const height = 10; // 보드의 세로 크기
const mineCount = 10; // 지뢰의 개수
let board = []; // 보드 셀 저장 배열
let minePositions = []; // 지뢰 위치 저장 배열
let openCells = 0; // 열린 셀 개수
let flagMines = 0; // 깃발이 꽂힌 지뢰 개수
let timerInterval; // 타이머를 위한 변수
let time = 0; // 게임 시간

// 보드 생성 함수
function createBoard() {
  const minesweeper = document.getElementById("minesweeper");
  minesweeper.innerHTML = ""; // 기존 보드 초기화
  time = 0;
  openCells = 0;
  flagMines = 0;
  document.getElementById("timer").innerText = time; // 타이머 초기화
  document.getElementById("mines-count").innerText = mineCount - flagMines; // 남은 지뢰 수 업데이트

  minePositions = placeMines(); // 지뢰 위치 설정

  // 보드에 셀 추가
  for (let i = 0; i < width * height; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell", "default"); // 기본 셀 설정
    cell.dataset.index = i;
    cell.addEventListener("click", () => openCell(cell)); // 좌클릭 이벤트
    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      flagCell(cell); // 우클릭 시 깃발
    });

    board.push(cell); // 셀을 보드에 추가
    minesweeper.appendChild(cell); // 보드에 셀 표시
  }
}

// 지뢰를 무작위로 배치하는 함수
function placeMines() {
  const positions = [];
  while (positions.length < mineCount) {
    const pos = Math.floor(Math.random() * width * height);
    if (!positions.includes(pos)) positions.push(pos); // 중복 없이 지뢰 위치 추가
  }
  return positions;
}

// 인접한 셀을 반환하는 함수
function getNearbyCells(index) {
  const nearby = [];
  const x = index % width;
  const y = Math.floor(index / width);

  // 인접한 셀 계산
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const newX = x + dx;
      const newY = y + dy;
      if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
        nearby.push(newY * width + newX);
      }
    }
  }
  return nearby;
}

// 셀을 열 때 호출되는 함수
function openCell(cell) {
  const index = parseInt(cell.dataset.index);
  if (cell.classList.contains("open") || cell.classList.contains("flag"))
    return; // 이미 열린 셀은 무시

  cell.classList.add("open");
  cell.classList.remove("default");
  openCells++; // 열린 셀 개수 증가

  // 지뢰를 클릭했을 때
  if (minePositions.includes(index)) {
    cell.classList.add("mine");
    clearInterval(timerInterval); // 타이머 중지
    openAll(); // 모든 셀을 열기
    setTimeout(() => {
      resetGame(); // 게임 리셋
    }, 2000);
  } else {
    const nearbyMines = countNearbyMines(index);
    if (nearbyMines > 0) {
      cell.innerText = nearbyMines; // 인접한 지뢰 개수 표시
    } else {
      getNearbyCells(index).forEach((i) => {
        const nearbyCell = board[i];
        if (!nearbyCell.classList.contains("open")) {
          openCell(nearbyCell); // 인접한 빈 셀을 재귀적으로 열기
        }
      });
    }
    checkWin(); // 승리 체크
  }
}

// 셀에 깃발을 꽂는 함수
function flagCell(cell) {
  if (cell.classList.contains("open")) return; // 열린 셀에는 깃발을 꽂을 수 없음

  if (cell.classList.contains("flag")) {
    cell.classList.remove("flag");
    flagMines--; // 깃발 제거
  } else {
    cell.classList.add("flag");
    flagMines++; // 깃발 추가
  }

  document.getElementById("mines-count").innerText = mineCount - flagMines; // 남은 지뢰 수 업데이트
  checkWin(); // 승리 체크
}

// 인접한 지뢰의 수를 계산하는 함수
function countNearbyMines(index) {
  const nearbyCells = getNearbyCells(index);
  let mineCount = 0;
  nearbyCells.forEach((i) => {
    if (minePositions.includes(i)) mineCount++; // 인접한 셀에 지뢰가 있으면 카운트 증가
  });
  return mineCount;
}

// 모든 셀을 열어보는 함수 (게임 오버 시 호출)
function openAll() {
  minePositions.forEach((index) => {
    const mineCell = board[index];
    if (!mineCell.classList.contains("flag")) {
      mineCell.classList.add("open", "mine"); // 지뢰가 있는 셀 열기
    } else {
      mineCell.classList.add("true-flag"); // 올바르게 표시된 깃발
    }
  });

  board.forEach((cell, index) => {
    if (cell.classList.contains("flag") && !minePositions.includes(index)) {
      cell.classList.add("false-flag"); // 잘못된 깃발 표시
    }
  });
}

// 승리 조건을 체크하는 함수
function checkWin() {
  if (openCells === width * height - mineCount && flagMines === mineCount) {
    clearInterval(timerInterval); // 타이머 중지
    alert(`이겼어요! 시간 : ${time}`); // 승리 메시지
  }
}

// 타이머를 시작하는 함수
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    time += 1;
    document.getElementById("timer").innerText = time; // 1초마다 시간 업데이트
  }, 1000);
}

// 게임을 리셋하는 함수
function resetGame() {
  board = [];
  createBoard(); // 보드 재생성
  startTimer(); // 타이머 시작
}

// 페이지 로드 시 게임을 시작하는 함수
window.onload = () => {
  resetGame();
};
