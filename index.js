(function game() {
  var canvas = document.querySelector('.game__board');
  var ctx = canvas.getContext('2d');
  var scoreSpan = document.querySelector('.score-span');
  var recordSpan = document.querySelector('.record-span');
  var gameHeader = document.querySelector('.game__header');
  var navItems = document.querySelectorAll('.nav__item');
  var messageDiv = document.querySelector('.message');
  var gameStatusDiv = document.querySelector('.game__status');

  document.addEventListener('keydown', handleKeyPress);
  document
    .querySelector('.new-game')
    .addEventListener('click', handleNewGameClick);
  document
    .querySelector('.cancel')
    .addEventListener('click', handleCancelClick);

  var INITIAL__SNAKE__POSITION = [
    { x: 9, y: 23, width: 15 },
    { x: 9, y: 24, width: 15 },
    { x: 9, y: 25, width: 15 },
  ];

  var game = (function setGame() {
    var started = false;
    var gameover = false;
    var pause = false;
    var score = 0;
    var record = 0;

    function checkForSpeedIncrease() {
      if (score == 50 || score == 150 || score == 300) {
        snake.increaseSpeed();
      }
    }

    function checkForNewRecord() {
      if (score > record) {
        record = score;
        localStorage.setItem('record', record);
        displayRecord();
      }
    }

    function displayScore() {
      scoreSpan.textContent = score;
    }

    function displayRecord() {
      recordSpan.textContent = record;
    }

    function isGameover() {
      return gameover;
    }

    function getPauseStatus() {
      return pause;
    }

    function getScore() {
      return score;
    }

    function isGameStarted() {
      return started;
    }

    function resetScore() {
      score = 0;
      displayScore();
    }
    function setInitialGameState() {
      pause = false;
      gameover = false;
      started = true;
    }

    function setRecord(num) {
      record = num;
    }

    function updateGameover() {
      gameover = !gameover;
    }

    function updatePause() {
      pause = !pause;
    }

    function updateScore() {
      if (score < 50) {
        score += 10;
      } else if (score < 200) {
        score += 15;
      } else if (score < 650) {
        score += 30;
      } else {
        score += 50;
      }
      displayScore();
      checkForSpeedIncrease();
    }

    function setIsGameStarted() {
      started = false;
    }

    return {
      checkForNewRecord,
      displayRecord,
      isGameover,
      getPauseStatus,
      getScore,
      isGameStarted,
      initializeGame,
      resetScore,
      updateGameover,
      updateScore,
      updatePause,
      setInitialGameState,
      setIsGameStarted,
      setRecord,
    };
  })();

  var snake = (function snake() {
    var directions = {
      x: 0,
      y: -1,
      heading: 'up',
    };

    // width has 20spots, height has30spots
    var positions = [];

    var speed = 150;

    function checkCollision() {
      var pos = [...positions];
      var head = pos.shift();
      var collided = pos.filter(checkForMatch).length != 0;

      function checkForMatch(val) {
        return val.x == head.x && val.y == head.y;
      }

      return collided;
    }

    function checkWall({ x, y, width }) {
      switch (true) {
        case x == -1:
          x = 19;
          break;
        case x == 20:
          x = 0;
          break;
        case y == -1:
          y = 29;
          break;
        case y == 30:
          y = 0;
          break;
        default:
          break;
      }
      return { x, y, width };
    }

    function changeDirection(hor, vert) {
      directions.x = hor;
      directions.y = vert;
    }

    function drawSnake(callback) {
      ctx.fillStyle = 'rgba(50,50,50, .5)';
      ctx.strokeStyle = '#000';
      positions.map(callback);
      if (checkCollision()) {
        game.updateGameover();
        game.updatePause();
        ctx.fillStyle = 'red';
        callback(positions[0]);
      }
      setHeading();
    }

    function eating() {
      var foodPos = food.getPosition();
      var headPos = positions[0];
      if (foodPos.x == headPos.x && foodPos.y == headPos.y) {
        positions.push(foodPos);
        food.updateScored();
        game.updateScore();
      }
    }

    function getDirections() {
      return directions;
    }

    function getPositions() {
      return positions;
    }

    function getSpeed() {
      return speed;
    }

    function increaseSpeed() {
      speed -= 50;
    }

    function moveSnake() {
      eating();
      var newHead = positions.pop();
      newHead.x = positions[0].x + directions.x;
      newHead.y = positions[0].y + directions.y;
      newHead = checkWall(newHead);
      positions.unshift(newHead);
    }

    function setHeading() {
      switch (directions.x) {
        case 1:
          directions.heading = 'right';
          break;
        case -1:
          directions.heading = 'left';
          break;
        default:
          break;
      }

      switch (directions.y) {
        case 1:
          directions.heading = 'down';
          break;
        case -1:
          directions.heading = 'up';
          break;
        default:
          break;
      }
    }

    function initializeSnake() {
      positions = [
        { ...INITIAL__SNAKE__POSITION[0] },
        { ...INITIAL__SNAKE__POSITION[1] },
        { ...INITIAL__SNAKE__POSITION[2] },
      ];
    }

    function setInitialDirection() {
      directions = {
        x: 0,
        y: -1,
        heading: 'up',
      };
    }

    function setInitialSpeed() {
      speed = 150;
    }

    return {
      changeDirection,
      drawSnake,
      getDirections,
      getPositions,
      getSpeed,
      increaseSpeed,
      initializeSnake,
      moveSnake,
      setInitialDirection,
      setInitialSpeed,
    };
  })();

  var food = (function createFood() {
    var foodPosition = {
      x: null,
      y: null,
      width: 15,
    };

    var scored = true;

    function checkOverlapping() {
      var snakePos = snake.getPositions();
      var overlap = snakePos.filter(checkForMatch);

      function checkForMatch(val) {
        return val.x == foodPosition.x && val.y == foodPosition.y;
      }

      return overlap.length != 0;
    }

    function drawFood() {
      ctx.fillStyle = 'rgb(218, 23, 23)';
      if (scored) {
        placeFood();
      }
      drawRect({
        x: foodPosition.x,
        y: foodPosition.y,
        width: foodPosition.width,
      });
    }

    function getPosition() {
      return foodPosition;
    }

    function placeFood() {
      foodPosition.x = Math.floor(Math.random() * 20);
      foodPosition.y = Math.floor(Math.random() * 30);
      if (checkOverlapping()) {
        placeFood();
      }
      scored = false;
    }

    function updateScored() {
      scored = !scored;
    }

    return {
      drawFood,
      getPosition,
      updateScored,
    };
  })();

  function clearCanvas(newGame) {
    ctx.fillStyle = 'rgb(62, 160, 30)';
    ctx.fillRect(0, 0, 300, 450);
    food.drawFood();
    snake.drawSnake(drawRect, newGame);
  }

  function drawRect({ x, y, width }) {
    ctx.strokeRect(x * width, y * width, width, width);
    ctx.fillRect(x * width, y * width, width, width);
  }

  function died() {
    game.setIsGameStarted();
    messageDiv.innerHTML = 'Press <kbd>ENTER</kbd> to start a new game!';
    gameStatusDiv.style.color = 'rgb(218, 23, 23)';
    gameStatusDiv.textContent = 'Game Over :/';
    game.checkForNewRecord();
  }

  function handleCancelClick() {
    game.updatePause();
    gameHeader.classList.add('hidden');
    gameStatusDiv.textContent = 'Game On! Enjoy!';
    startAnimation();
  }

  function handleNewGameClick() {
    gameHeader.classList.add('hidden');
    messageDiv.innerHTML = 'Press <kbd>SPACE</kbd> to pause the game!';
    gameStatusDiv.style.color = '';
    gameStatusDiv.textContent = 'Game On! Enjoy!';
    console.log(snake.getPositions());
    console.log(INITIAL__SNAKE__POSITION);
    console.log(snake.getSpeed());
    setGameState();
    clearCanvas();
    startAnimation();
  }

  function handleKeyPress(e) {
    var directions = snake.getDirections();
    switch (e.keyCode) {
      case 37:
        if (directions.heading != 'right') {
          snake.changeDirection(-1, 0);
        }
        break;
      case 38:
        if (directions.heading != 'down') {
          snake.changeDirection(0, -1);
        }
        break;
      case 39:
        if (directions.heading != 'left') {
          snake.changeDirection(1, 0);
        }
        break;
      case 40:
        if (directions.heading != 'up') {
          snake.changeDirection(0, 1);
        }
        break;
      case 32:
        if (game.isGameStarted()) {
          if (game.getPauseStatus()) {
            handleCancelClick();
          } else {
            game.updatePause();
            navItems[1].classList.remove('hidden');
            gameHeader.classList.remove('hidden');
            gameStatusDiv.textContent = 'Game Paused!';
          }
        }
        break;
      case 13:
        if (!game.isGameStarted() && game.isGameover()) {
          handleNewGameClick();
        }
        break;
      default:
        break;
    }
  }

  function initializeGame() {
    navItems[1].classList.add('hidden');
    var savedRecord = localStorage.getItem('record');
    if (savedRecord) {
      game.setRecord(savedRecord);
    }
    game.displayRecord();
    snake.initializeSnake();
    clearCanvas();
  }

  function setGameState() {
    game.setInitialGameState();
    game.resetScore();
    snake.initializeSnake();
    snake.setInitialDirection();
    snake.setInitialSpeed();
    food.updateScored();
  }

  function startAnimation() {
    var speed = snake.getSpeed();
    var startTime = 0;
    function animateSnake(timeStamp) {
      if (startTime == 0) startTime = timeStamp;
      var progress = timeStamp - startTime;
      if (game.getPauseStatus()) {
        if (game.isGameover()) {
          died();
        }
        return;
      }

      if (progress >= speed) {
        snake.moveSnake();
        clearCanvas();
        startTime = 0;
      }
      requestAnimationFrame(animateSnake);
    }
    requestAnimationFrame(animateSnake);
  }

  initializeGame();
})();
