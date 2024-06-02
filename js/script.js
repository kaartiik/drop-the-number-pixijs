window.onload = function () {
  const canvas = document.getElementById('canvas');
  const volumeControl = document.getElementById('volumeControl');
  const gameVolumeBtn = document.getElementById('gameVolume');
  const gameMuteBtn = document.getElementById('gameMute');
  const gameMuteImg = document.getElementById('gameMuteImg');
  const gamePauseBtn = document.getElementById('gamePause');
  const pauseMenuModal = document.getElementById('overlay');
  const menuResumeBtn = document.getElementById('menuResume');
  const menuRestartBtn = document.getElementById('menuRestart');
  const menuExitButton = document.getElementById('menuExit');
  const menuExitXButton = document.getElementById('menuExitX');
  const landingPage = document.getElementById('landingPage');
  const landingStartBtn = document.getElementById('landingStart');
  const landingHowToBtn = document.getElementById('landingHowTo');
  const gameOverModal = document.getElementById('gameOverOverlay');
  const gameOverTextOverlay = document.getElementById('gameOverTextOverlay');
  const gameOverText = document.getElementById('gameOverText');
  const timerDisplay = document.getElementById('timer');
  const scoreDisplay = document.getElementById('score');
  const finalScoreDisplay = document.getElementById('finalScore');
  const gameOverPlayAgainBtn = document.getElementById('gameOverPlayAgain');

  const bgAudio = new Audio('../audio/2048_bg_music.mp3');
  bgAudio.loop = true;

  gameVolumeBtn.onpointerdown = displayVolumeControl;
  gameMuteBtn.onpointerdown = muteVolumeControl;

  volumeControl.addEventListener('change', function (e) {
    bgAudio.volume = e.currentTarget.value / 100;
    console.log('volume:', e.currentTarget.value / 100);
  });

  //Only play audio when screen is focused
  window.addEventListener('blur', muteAudioWhenNotFocused);
  window.addEventListener('focus', unmuteWhenFocused);

  landingStartBtn.onpointerdown = startGame;
  landingHowToBtn.onpointerdown = startGame;

  gamePauseBtn.onpointerdown = pauseGame;
  menuResumeBtn.onpointerdown = resumeGame;
  menuRestartBtn.onpointerdown = playAgainTest;
  menuExitButton.onpointerdown = () => location.reload();
  menuExitXButton.onpointerdown = resumeGame;

  gameOverPlayAgainBtn.onpointerdown = playAgainTest;

  let gamePaused = false;

  //Check if deveice is mobile
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const app = new PIXI.Application({
    width: isMobile ? window.innerWidth : window.innerHeight * (9 / 16),
    height: window.innerHeight,
    transparent: false,
    backgroundColor: 0x000000,
  });
  canvas.appendChild(app.view);

  //Global screen dimensions
  const SCREEN_WIDTH = app.screen.width;
  const SCREEN_HEIGHT = app.screen.height;

  //Grid BG dimensions
  const GRID_DIMENSION = SCREEN_WIDTH - (1 / 4) * SCREEN_WIDTH;
  const GRID_START_X = (SCREEN_WIDTH - GRID_DIMENSION) / 2;
  const GRID_START_Y =
    SCREEN_HEIGHT - GRID_DIMENSION - (1 / 20) * SCREEN_HEIGHT;

  //Block dimension
  const portraitTileDimension = (1 / 5.3) * GRID_DIMENSION;

  //character dimensions
  const characterWidth = (SCREEN_WIDTH - (3 / 4) * SCREEN_WIDTH) * 2;
  const characterHeight = (SCREEN_WIDTH - (2.5 / 4) * SCREEN_WIDTH) * 1.8;
  const characterX = GRID_START_X + GRID_DIMENSION - characterWidth * 0.8;
  const characterY = GRID_START_Y - characterHeight * 0.85;

  //rocket dimensions and position
  const rocketWidth = SCREEN_WIDTH - (3 / 4) * SCREEN_WIDTH;
  const rocketHeight = SCREEN_WIDTH - (2.5 / 4) * SCREEN_WIDTH;
  const rocketX = GRID_START_X + GRID_DIMENSION - rocketWidth * 2;
  const rocketY = GRID_START_Y - rocketHeight - 10;

  let gameover;
  let currentDroppingTile;
  let activeTickers;

  let timerCountdown;
  let intervalTimer;
  let score;

  //Helper variable for thunder cloud power up
  let thunderCloudPowerUpClicked;
  let sameBlockIndex;

  // Level object
  let level = {
    x: GRID_START_X, // X position
    y: GRID_START_Y, // Y position
    columns: 5, // Number of tile columns
    rows: 5, // Number of tile rows
    tilewidth: portraitTileDimension, // Visual width of a tile
    tileheight: portraitTileDimension, // Visual height of a tile
    startHighestBlock: 2,
    selectedtile: { selected: false, column: 0, row: 0 },
    powerUpDisplayMs: 5000,
  };

  //Game Background sprite
  let bg;
  let gridBG;

  //game logic tickers variables
  let tickerBlockFall;
  let tickerMergedBlockFall;
  let tickerBlockShift;
  let tickerRocket;

  //To remove active block dropping/merging ticker when is restarted from pause menu
  let removeTickerBlockFall = null;
  let removeTickerMergeBlock = null;

  //powerup ticker variables
  let tickerUFO;
  let tickerLightBulb;
  let tickerThunderCloud;

  //powerups interval timers. To pause setTimeout that renders powerups
  let lightbulbTimer;
  let ufoTimer;
  let thundercloudTimer;

  //powerups
  let ufoPowerUp;
  let thunderCloudPowerUp;
  let lightbulbPowerUp;

  //All block textures loaded
  const tile2Texture = {
    number: 2,
    texture: new PIXI.Texture.from('../images/game_assets/block_2.png'),
  };
  const tile4Texture = {
    number: 4,
    texture: new PIXI.Texture.from('../images/game_assets/block_4.png'),
  };
  const tile8Texture = {
    number: 8,
    texture: new PIXI.Texture.from('../images/game_assets/block_8.png'),
  };
  const tile16Texture = {
    number: 16,
    texture: new PIXI.Texture.from('../images/game_assets/block_16.png'),
  };
  const tile32Texture = {
    number: 32,
    texture: new PIXI.Texture.from('../images/game_assets/block_32.png'),
  };
  const tile64Texture = {
    number: 64,
    texture: new PIXI.Texture.from('../images/game_assets/block_64.png'),
  };
  const tile128Texture = {
    number: 128,
    texture: new PIXI.Texture.from('../images/game_assets/block_128.png'),
  };
  const tile256Texture = {
    number: 256,
    texture: new PIXI.Texture.from('../images/game_assets/block_256.png'),
  };
  const tile512Texture = {
    number: 512,
    texture: new PIXI.Texture.from('../images/game_assets/block_512.png'),
  };
  const tile1024Texture = {
    number: 1024,
    texture: new PIXI.Texture.from('../images/game_assets/block_1024.png'),
  };
  const tile2048Texture = {
    number: 2048,
    texture: new PIXI.Texture.from('../images/game_assets/block_2048.png'),
  };
  const tile4096Texture = {
    number: 4096,
    texture: new PIXI.Texture.from('../images/game_assets/block_4096.png'),
  };

  //Blocks textures currently available in level
  let gameLevelTileImages;

  //All block textures
  const tileImages = [
    tile2Texture,
    tile4Texture,
    tile8Texture,
    tile16Texture,
    tile32Texture,
    tile64Texture,
    tile128Texture,
    tile256Texture,
    tile512Texture,
    tile1024Texture,
    tile2048Texture,
    tile4096Texture,
  ];

  //Contains all static & flting rocket textures
  const rocketTextures = [
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_01.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_01.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_02.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_02.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_03.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_03.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_04.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_04.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_05.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_05.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_06.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_06.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_07.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_07.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_08.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_08.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_09.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_09.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_10.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_10.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_11.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_11.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_12.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_12.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_13.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_13.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_14.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_13.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_15.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_14.png'),
    },
    {
      static: new PIXI.Texture.from('../images/rockets/rocket_16.png'),
      flying: new PIXI.Texture.from('../images/rockets/flyingrocket_15.png'),
    },
  ];

  let generatedNumber;
  let initialColumnTile;

  let grid;

  let rocket;
  let rocketTextureIndex;
  let currentRocketTexture;
  let smokepuffAnimation;

  //Character animated sprites
  let characterAnimation;

  //Character animation case
  const IDLE = 'idle';
  const JUMP = 'jump';
  const BUILD = 'build';
  const GOLDEN_BUILD = 'goldenBuild';
  const EUREKA = 'eureka';

  function initVariables() {
    generatedNumber = -1;
    initialColumnTile = -1;

    gameLevelTileImages = [
      tile2Texture,
      tile4Texture,
      tile8Texture,
      tile16Texture,
    ];

    //game logic tickers.
    //Autostart is false and ticker is stopped initially to prevent tickers from running automatically when listener is added.
    tickerBlockFall = PIXI.Ticker.system; //system ticker is able to be stopped eventhough other shared tickers are running
    tickerBlockFall.autoStart = false;
    tickerBlockFall.stop();

    tickerMergedBlockFall = PIXI.Ticker.system;
    tickerMergedBlockFall.autoStart = false;
    tickerMergedBlockFall.stop();

    tickerBlockShift = PIXI.Ticker.system;
    tickerBlockShift.autoStart = false;
    tickerBlockShift.stop();

    tickerRocket = PIXI.Ticker.shared;

    //powerup tickers
    //Autostart is false and ticker is stopped initially to prevent tickers from running automatically when listener is added.
    tickerUFO = PIXI.Ticker.system;
    tickerUFO.autoStart = false;
    tickerUFO.stop();

    tickerLightBulb = PIXI.Ticker.system;
    tickerLightBulb.autoStart = false;
    tickerLightBulb.stop();

    tickerThunderCloud = PIXI.Ticker.system;
    tickerThunderCloud.autoStart = false;
    tickerThunderCloud.stop();

    //Init rocket texture index set
    rocketTextureIndex = 0;

    //init score
    score = 0;
    scoreDisplay.innerHTML = score;

    //init thunder cloud helper variables
    thunderCloudPowerUpClicked = false;
    sameBlockIndex = -1;

    //Init gameover variables
    gameover = false;
    gameOverText.innerHTML = 'Game Over';

    //Init pixi ticker counts
    activeTickers = {
      number: 0,
      shifting: 0,
    };
  }

  //load game BG
  function loadBG(texture) {
    bg = new PIXI.Sprite(texture);
    bg.width = SCREEN_WIDTH + 100;

    //Set bottom right corner of image as anchor
    bg.anchor.set(1, 1);
    bg.x = SCREEN_WIDTH;
    bg.y = SCREEN_HEIGHT + 200;

    app.stage.addChild(bg);
  }

  //Perform the game over rocket flying animation
  function doRocketFly() {
    const stageChildren = app.stage.children;

    //determine index of NumberTiles in the stage
    const numberTilesIndicesUnfiltered = stageChildren.map((item, idx) => {
      if (item instanceof NumberTile) return idx;
      else return -1;
    });

    //Filter to only keep number tile indices
    const numberTilesIndices = numberTilesIndicesUnfiltered.filter(
      (item) => item !== -1
    );

    //Compute distance to fly proportionate to the score
    let maxDistanceToTravel =
      (bg.texture.height / rocketTextures.length) * (rocketTextureIndex + 1);

    //Move down animation
    function middle1(delta) {
      let yDistance = 0.005 * bg.y;

      //To make sure the animation stays within the BG height
      if (bg.y + yDistance <= maxDistanceToTravel) {
        bg.y += yDistance;
        gridBG.y += yDistance;
        characterAnimation.disappearDown(yDistance);

        if (lightbulbPowerUp) lightbulbPowerUp.disappearDown(yDistance);
        if (ufoPowerUp) ufoPowerUp.disappearDown(yDistance);
        if (thunderCloudPowerUp) thunderCloudPowerUp.disappearDown(yDistance);

        numberTilesIndices.forEach((item) => {
          stageChildren[item].disappearDown(yDistance);
        });
      } else {
        rocket.y -= 15;

        //Once rocket disappears from canvas
        if (rocket.y <= -rocket.height) {
          tickerRocket.remove(middle1);
          //Displays score modal
          gameOverModal.style.display = 'block';
        }
      }
    }

    tickerRocket.add(middle1);
  }

  // add grid BG
  function loadGridBG(texture) {
    gridBG = new PIXI.Sprite(texture);
    gridBG.width = GRID_DIMENSION;
    gridBG.height = GRID_DIMENSION;
    gridBG.x = GRID_START_X;
    gridBG.y = GRID_START_Y;
    gridBG.interactive = true;
    gridBG.on('pointerdown', handlePointerDown);

    app.stage.addChild(gridBG);
  }

  //Load smokepuff and character animation textures
  function loadToons() {
    app.loader
      .add('bgTexture', '../images/game_assets/game_bg.png')
      .add('gridBGTexture', '../images/game_assets/bg_grid.png')
      .add('rocketTexture', '../images/rockets/rocket_01.png')
      .add('../images/smokepuff/smokepuff.json')
      .add('../images/character_assets/character_idle/character_idle.json')
      .add('../images/character_assets/character_jump/character_jump.json')
      .add('../images/character_assets/character_tools/character_tools.json')
      .add(
        '../images/character_assets/character_golden_tools/character_golden_tools.json'
      )
      .add('../images/character_assets/character_eureka/character_eureka.json')
      .load(setup);

    function setup(loader, resources) {
      const smokepuffTextures = [];
      const characterTextures = {};
      characterTextures[IDLE] = [];
      characterTextures[JUMP] = [];
      characterTextures[BUILD] = [];
      characterTextures[GOLDEN_BUILD] = [];
      characterTextures[EUREKA] = [];

      loadBG(resources.bgTexture.texture);
      loadGridBG(resources.gridBGTexture.texture);
      initLoadRocket(resources.rocketTexture.texture);

      //Smokepuff textures
      for (let i = 1; i <= 9; i++) {
        const texture = new PIXI.Texture.from(
          `../images/smokepuff/Smoke ${i}.png`
        );

        // magically works since the spritesheet was loaded with the pixi loader
        smokepuffTextures.push(texture);
      }

      //Character idle textures.
      for (let i = 1; i <= 3; i++) {
        const texture = new PIXI.Texture.from(
          `../images/character_assets/character_idle/Idle${i}.png`
        );

        // magically works since the spritesheet was loaded with the pixi loader
        characterTextures[IDLE].push(texture);
      }

      //Character jump textures.
      for (let i = 1; i <= 4; i++) {
        const texture = new PIXI.Texture.from(
          `../images/character_assets/character_jump/Jump${i}.png`
        );

        // magically works since the spritesheet was loaded with the pixi loader
        characterTextures[JUMP].push(texture);
      }

      //Character drill textures.
      for (let i = 1; i <= 6; i++) {
        const texture = new PIXI.Texture.from(
          `../images/character_assets/character_tools/Tool${i}.png`
        );

        // magically works since the spritesheet was loaded with the pixi loader
        characterTextures[BUILD].push(texture);
      }

      //Character golden saw textures.
      for (let i = 1; i <= 4; i++) {
        const texture = new PIXI.Texture.from(
          `../images/character_assets/character_golden_tools/GTool${i}.png`
        );

        // magically works since the spritesheet was loaded with the pixi loader
        characterTextures[GOLDEN_BUILD].push(texture);
      }

      //Character thinking textures.
      for (let i = 1; i <= 5; i++) {
        const texture = new PIXI.Texture.from(
          `../images/character_assets/character_eureka/Eureka${i}.png`
        );

        // magically works since the spritesheet was loaded with the pixi loader
        characterTextures[EUREKA].push(texture);
      }

      smokepuffAnimation = new Smokepuff(
        rocketX - 0.18 * rocketX,
        rocketY - 20,
        rocketWidth * 1.5,
        rocketHeight * 1.5,
        smokepuffTextures
      );

      characterAnimation = new Toon(
        characterX,
        characterY,
        characterWidth,
        characterHeight,
        characterTextures
      );

      app.stage.addChild(characterAnimation);
    }
  }

  // Initial rocket sprite load
  function initLoadRocket(texture) {
    if (rocket !== null && rocket !== undefined) {
      app.stage.removeChild(rocket);
    }
    rocket = new PIXI.Sprite(texture);
    rocket.width = rocketWidth;
    rocket.height = rocketHeight;
    rocket.x = rocketX;
    rocket.y = rocketY;
    app.stage.addChild(rocket);
  }

  // add rocket
  function rocketProgressionEffect(textureIndex) {
    if (currentRocketTexture !== rocketTextures[textureIndex].static) {
      if (rocket !== null && rocket !== undefined) {
        app.stage.removeChild(rocket);
      }

      if (textureIndex === rocketTextures.length - 1) {
        characterAnimation.goldenBuild();
      } else {
        characterAnimation.build();
      }
      currentRocketTexture = rocketTextures[textureIndex].static;

      rocketTextureIndex = textureIndex;
      rocket = new PIXI.Sprite(rocketTextures[textureIndex].static);
      rocket.width = rocketWidth;
      rocket.height = rocketHeight;
      rocket.x = rocketX;
      rocket.y = rocketY;
      app.stage.addChild(rocket);

      if (smokepuffAnimation !== null && smokepuffAnimation !== undefined) {
        app.stage.addChild(smokepuffAnimation);
        smokepuffAnimation.play();
        smokepuffAnimation.onComplete = function () {
          app.stage.removeChild(smokepuffAnimation);
        };
      }
    }
  }

  //Change current rocket sprite to flying rocket and add character build and smokepuff animation before rocket sprite is upgraded
  function loadRocketFly() {
    if (rocket !== null && rocket !== undefined) {
      app.stage.removeChild(rocket);
    }
    rocket = new PIXI.Sprite(rocketTextures[rocketTextureIndex].flying);
    rocket.width = rocketWidth;

    //Retain rocket height for initial rocket sprite because it doesnt have booster effect
    rocket.height =
      rocketTextureIndex === 0 ? rocketHeight : rocketHeight * 1.8;
    rocket.x = rocketX;
    rocket.y = rocketY;
    app.stage.addChild(rocket);
  }

  //Render rocket upgrade according to the score
  function rocketProgression() {
    if (score < 100) {
      // loadRocket(0);
    } else if (score < 250) {
      rocketProgressionEffect(1);
    } else if (score < 500) {
      rocketProgressionEffect(2);
    } else if (score < 750) {
      rocketProgressionEffect(3);
    } else if (score < 1000) {
      rocketProgressionEffect(4);
    } else if (score < 2000) {
      rocketProgressionEffect(5);
    } else if (score < 4000) {
      rocketProgressionEffect(6);
    } else if (score < 7000) {
      rocketProgressionEffect(7);
    } else if (score < 10000) {
      rocketProgressionEffect(8);
    } else if (score < 12500) {
      rocketProgressionEffect(9);
    } else if (score < 15000) {
      rocketProgressionEffect(10);
    } else if (score < 20000) {
      rocketProgressionEffect(11);
    } else if (score < 25000) {
      rocketProgressionEffect(12);
    } else if (score < 30000) {
      rocketProgressionEffect(13);
    } else if (score < 30001) {
      rocketProgressionEffect(14);
    } else {
      rocketProgressionEffect(15);
    }
  }

  function audioMobileOrBrowser() {
    //On android & iOS users have to manually click audio to play
    //So audio is muted to let users to tap unmute
    if (isMobile) {
      bgAudio.muted = true;
      gameMuteImg.src = './images/game_assets/button_sound_OFF.png';
    } else {
      bgAudio.play();
    }
  }

  function displayVolumeControl() {
    if (volumeControl.style.display === 'none')
      volumeControl.style.display = 'block';
    else volumeControl.style.display = 'none';
  }

  function muteAudioWhenNotFocused() {
    //Only mute audio on mobile when screen is not focused. Pause audio on desktop
    if (isMobile) {
      bgAudio.muted = true;
      gameMuteImg.src = './images/game_assets/button_sound_OFF.png';
    } else {
      bgAudio.pause();
    }
  }

  function unmuteWhenFocused() {
    //To prevent the ngm from playing when focusing on landing page
    if (landingPage.style.display === 'none') bgAudio.play();
  }

  function muteVolumeControl() {
    if (gameMuteImg.src.match('./images/game_assets/button_sound_OFF.png')) {
      if (isMobile) {
        //On android & iOS users have to manually click audio to play
        bgAudio.play();
      }
      bgAudio.muted = false;
      gameMuteImg.src = './images/game_assets/button_sound_ON.png';
    } else {
      bgAudio.muted = true;
      gameMuteImg.src = './images/game_assets/button_sound_OFF.png';
    }
  }

  function initGrid() {
    grid = new Grid(
      app.screen.width,
      app.screen.height,
      level.rows,
      level.columns,
      level.tilewidth * 1.08,
      level.x,
      level.y,
      level.startHighestBlock,
      tileImages,
      (initialRowTile, initialColumnTile, generatedNumber) =>
        generateNewMergedTile(
          initialRowTile,
          initialColumnTile,
          generatedNumber
        ),
      () => addNewTileToGameLevel(),
      activeTickers,
      tilesShiftingAnimation
    );
  }

  function playAgainTest() {
    //To skip landing page after reloading
    sessionStorage.setItem('reloading', 'true');
    location.reload();
  }

  //Restarts the game
  function playAgain() {
    //remove tickers that run animations
    if (removeTickerBlockFall) removeTickerBlockFall();
    if (removeTickerMergeBlock) removeTickerMergeBlock();

    //Destroys any loaded spritesheets
    app.loader.destroy();

    // Cancel any seTimeout running to render powerups
    lightbulbTimer.cancel();
    ufoTimer.cancel();
    thundercloudTimer.cancel();
    clearGrid();
    preloadAssetsAndVariables();
    init();
    //Hide pause menu if game is restarted from menu
    hidePauseMenu();
    gameOverModal.style.display = 'none';
  }

  function clearGrid() {
    app.stage.removeChildren(3, app.stage.children.length - 1);
  }

  function startGame() {
    landingPage.style.display = 'none';
    init();
  }

  function preloadAssetsAndVariables() {
    initVariables();
    main(0);

    //If game restarted from in-game. Reload page open game directly
    //without landing page
    const reloading = sessionStorage.getItem('reloading');
    if (reloading) {
      sessionStorage.removeItem('reloading');
      startGame();
    }
  }

  preloadAssetsAndVariables();

  function init() {
    timer();
    newGame();

    //Different audio settings for mobile and browser
    audioMobileOrBrowser();

    // Enter main loop
  }

  function timer() {
    //setInterval to countdown game time

    let timeleft = 180;

    timerCountdown = new RecurringTimer(function () {
      if (timeleft <= 0) {
        timerDisplay.innerHTML = timeleft;
        timerCountdown.pause();
        gameover = true;
        gameOverText.innerHTML = "Time's Up";
      } else {
        timerDisplay.innerHTML = timeleft;
      }
      timeleft -= 1;
    }, 1000);
  }

  function newGame() {
    intervalTimer = setInterval(function () {
      checkGameOver();

      if (gameover) {
        gameOver();
      }

      generateNewDroppingTileLoop();
    }, 1000);
  }

  // Main loop
  function main(tframe) {
    render();
  }

  function render() {
    loadToons();
    initGrid();
    rocketProgression();
    ufoIntervalMs();
    thunderCloudIntervalMs();
    randomLightBulbIntervalMs();
  }

  //Load the UFO powerup button with 20% propbability only once per game
  function renderUFOPowerUp() {
    //Dont render powerup if game is paused or gameover
    if (!gamePaused && !gameover) {
      const ufoTexture = new PIXI.Texture.from(
        '../images/game_assets/asset_ufo_with_beam.png'
      );

      ufoPowerUp = new UFOPowerUp(ufoTexture, SCREEN_WIDTH);

      if (ufoPowerUp.showUFOPowerUp()) {
        if (!ufoPowerUp.getButtonClicked()) {
          ufoPowerUp.on('pointerdown', () =>
            ufoHandlePointerDown(
              () => tickerUFO.remove(middle),
              () => app.stage.removeChild(ufoPowerUp)
            )
          );
        }

        app.stage.addChild(ufoPowerUp);

        //Add ticker to run animation and start it
        function middle(delta) {
          ufoPowerUp.flyAcross(
            delta,
            () => tickerUFO.remove(middle),
            () => {
              app.stage.removeChild(ufoPowerUp);
              ufoPowerUp = null;
            }
          );
        }

        tickerUFO.add(middle);
        tickerUFO.start();
      }
    }
  }

  function ufoIntervalMs() {
    //setTimeout for next render
    ufoTimer = new PowerUpTimer(() => {
      renderUFOPowerUp();
    }, 100000);
  }

  //Load the storm powerup button with 20% propbability every 45 seconds
  function renderThunderCloudPowerUp() {
    if (
      !gamePaused &&
      !gameover &&
      (thunderCloudPowerUp === null || thunderCloudPowerUp === undefined)
    ) {
      const thunderCloudTexture = new PIXI.Texture.from(
        '../images/game_assets/asset_power_Drill.png'
      );
      thunderCloudPowerUp = new ThunderCloudPowerUp(
        thunderCloudTexture,
        SCREEN_WIDTH
      );

      if (thunderCloudPowerUp.showThunderCloudPowerUp()) {
        if (!thunderCloudPowerUp.getButtonClicked()) {
          thunderCloudPowerUp.on('pointerdown', () =>
            thunderCloudHandlePointerDown(
              () => tickerThunderCloud.remove(middle),
              () => {
                app.stage.removeChild(thunderCloudPowerUp);
                thunderCloudPowerUp = null;
              }
            )
          );
        }

        app.stage.addChild(thunderCloudPowerUp);

        //Add ticker to run animation and start it
        function middle(delta) {
          thunderCloudPowerUp.flyAcross(
            delta,
            () => tickerThunderCloud.remove(middle),
            () => {
              app.stage.removeChild(thunderCloudPowerUp);
              thunderCloudPowerUp = null;
            },
            () => thunderCloudIntervalMs()
          );
        }

        tickerThunderCloud.add(middle);
        tickerThunderCloud.start();
      }
    }
  }

  function thunderCloudIntervalMs() {
    //setTimeout for next render
    thundercloudTimer = new PowerUpTimer(() => {
      renderThunderCloudPowerUp();
    }, 45000);
  }

  //Occurs 15-30 seconds throughout the game (random interval).
  function renderLightBulbPowerUp() {
    if (
      !gamePaused &&
      !gameover &&
      (lightbulbPowerUp === null || lightbulbPowerUp === undefined)
    ) {
      const lightBulbTexture = new PIXI.Texture.from(
        '../images/character_assets/lightbulb.png'
      );
      lightbulbPowerUp = new LightbulbPowerUp(
        lightBulbTexture,
        characterX + 50,
        characterY + 50
      );

      lightbulbPowerUp.on('pointerdown', () =>
        lightbulbHandlePointerDown(
          () => tickerLightBulb.remove(middle),
          () => {
            app.stage.removeChild(lightbulbPowerUp);
            lightbulbPowerUp = null;
          }
        )
      );

      //Load the character animation accordingly
      characterAnimation.eureka();

      app.stage.addChild(lightbulbPowerUp);

      //Add ticker to run animation and start it

      function middle(delta) {
        lightbulbPowerUp.grow(
          delta,
          () => tickerLightBulb.remove(middle),
          () => {
            app.stage.removeChild(lightbulbPowerUp);
            lightbulbPowerUp = null;
          },
          () => randomLightBulbIntervalMs()
        );
      }

      tickerLightBulb.add(middle);
      tickerLightBulb.start();
    }
  }

  function randomLightBulbIntervalMs() {
    //setTimeout for next render
    const showAfterMs = Math.floor(Math.random() * (30 - 15) + 15) * 1000;

    lightbulbTimer = new PowerUpTimer(() => {
      renderLightBulbPowerUp();
    }, showAfterMs);
  }

  function lightbulbHandlePointerDown(removeTicker, removeChild) {
    // console.log('lightbulb clicked');
    lightbulbPowerUp.setButtonClicked(true);
    removeTicker();
    removeChild();
    tickerBlockFall.stop();
    grid.identifyLargestBlockToRemove();
    if (activeTickers.number > 0) {
      checkNewColumnLastTile();
    }
    addScoreWhenTileRemoved();
    grid.removeClusters();
    grid.calculateTileShift();
    grid.shiftTiles();
    setTimeout(() => tickerBlockFall.start(), 1500);
    randomLightBulbIntervalMs();
  }

  function ufoHandlePointerDown(removeTicker, removeChild) {
    // console.log('ufo clicked');
    ufoPowerUp.setButtonClicked(true);
    removeTicker();
    removeChild();
    tickerBlockFall.stop();
    grid.removeAllBlocks();
    if (activeTickers.number > 0) {
      checkNewColumnLastTile();
    }
    const score = grid.getScoreAllBlocksRemoved();
    addScore(score);
    setTimeout(() => tickerBlockFall.start(), 1500);
  }

  function thunderCloudHandlePointerDown(removeTicker, removeChild) {
    // console.log('thunder cloud clicked');
    thunderCloudPowerUp.setButtonClicked(true);
    removeTicker();
    removeChild();
    thunderCloudPowerUpClicked = true;
    sameBlockIndex = generateRandomNumber();
    // console.log('Same Number Block is', sameBlockIndex);
    setTimeout(() => {
      thunderCloudPowerUpClicked = false;
    }, 8000);
    thunderCloudIntervalMs();
  }

  function pauseGame() {
    // console.log('Paused');
    //Stops block rendering interval loop
    clearInterval(intervalTimer);

    //Pause game timer
    timerCountdown.pause();

    //Pause game logic animation tickers
    tickerBlockFall.stop();
    tickerMergedBlockFall.stop();
    tickerBlockShift.stop();

    //Pause game powerup tickers
    tickerUFO.stop();
    tickerLightBulb.stop();
    tickerThunderCloud.stop();

    //Pause game power render timeouts
    lightbulbTimer.pause();
    thundercloudTimer.pause();
    ufoTimer.pause();

    displayPauseMenu();
  }

  function resumeGame() {
    // console.log('Resume');
    hidePauseMenu();

    //Resume game timer
    timerCountdown.resume();

    //Resume game logic animation tickers
    tickerBlockFall.start();
    tickerMergedBlockFall.start();
    tickerBlockShift.start();

    //Resume game powerup tickers
    tickerUFO.start();
    tickerLightBulb.start();
    tickerThunderCloud.start();

    //Resume game power render timeouts
    lightbulbTimer.resume();
    thundercloudTimer.resume();
    ufoTimer.resume();

    //Continue dropping block rendering lopp
    newGame();
  }

  function displayPauseMenu() {
    gamePaused = true;
    pauseMenuModal.style.display = 'block';
  }

  function hidePauseMenu() {
    gamePaused = false;
    pauseMenuModal.style.display = 'none';
  }

  function tileIsInArray(tileValue) {
    return gameLevelTileImages.some((item) => item.number === tileValue);
  }

  //Add new higher value blocks to the game if user manage to reach certain threshold
  function addNewTileToGameLevel() {
    let highest = grid.getHighestTileValue();

    switch (highest) {
      case 32:
        if (!tileIsInArray(32)) gameLevelTileImages.push(tile32Texture);
        break;
      case 128:
        if (!tileIsInArray(64)) gameLevelTileImages.push(tile64Texture);
        break;
      case 512:
        if (!tileIsInArray(128)) gameLevelTileImages.push(tile128Texture);
        break;
      case 1024:
        if (!tileIsInArray(256)) gameLevelTileImages.push(tile256Texture);
        break;
      case 2048:
        if (!tileIsInArray(512)) gameLevelTileImages.push(tile512Texture);
        break;
      default:
        break;
    }
  }

  //Add score when the highest block is removed
  function addScoreWhenTileRemoved() {
    let highest = grid.getHighestTileValueRemoved();

    switch (highest) {
      case 2:
        addScore(1);
        break;
      case 4:
        addScore(5);
        break;
      case 8:
        addScore(15);
        break;
      case 16:
        addScore(40);
        break;
      case 32:
        addScore(100);
        break;
      case 64:
        addScore(300);
        break;
      case 128:
        addScore(500);
        break;
      case 256:
        addScore(1000);
        break;
      case 512:
        addScore(3000);
        break;
      case 1024:
        addScore(6000);
        break;
      case 2048:
        addScore(10000);
        break;
      case 4096:
        addScore(30000);
        break;
      default:
        break;
    }
  }

  //Check if there are any blocks in the top row and end game if there is
  function checkGameOver() {
    for (var col = 0; col < level.columns; col++) {
      if (grid.matrix[0][col].type >= 0) {
        // console.log('GAMEOVERRRRRRRRRRRRRRRRRRRRRRRRRRRRRR');
        gameover = true;
      }
    }
  }

  function gameOver() {
    gameOverTextOverlay.style.display = 'block';

    setTimeout(() => {
      //Hide game over text modal
      gameOverTextOverlay.style.display = 'none';

      //Render character jump animation
      characterAnimation.jump();

      if (score > 0) {
        //Change rocket texture to flying rocket
        loadRocketFly();

        //Do rocket fly animation
        doRocketFly();
      } else {
        //Displays score modal
        gameOverModal.style.display = 'block';
      }
      //Timeout need to match the length game over text fade in seconds
    }, 3000);

    //Stops dropping block rendering loop
    clearInterval(intervalTimer);
    //Stops dgame timer
    timerCountdown.pause();

    //Stops powerup tickers
    tickerUFO.stop();
    tickerLightBulb.stop();
    tickerThunderCloud.stop();

    // Cancel any seTimeout running to render powerups
    lightbulbTimer.cancel();
    ufoTimer.cancel();
    thundercloudTimer.cancel();
  }

  //Check again for last empty column tile when a power up is used to remove blocks
  function checkNewColumnLastTile() {
    let initialColumnTile = currentDroppingTile.getRowAndColumn();

    let destinationTile = grid.checkColumnAndReturnLastEmptyTile(
      initialColumnTile.column
    );

    currentDroppingTile.setDestinationY(destinationTile.y);

    currentDroppingTile.setRowAndCol(destinationTile.row, destinationTile.col);
  }

  function generateNewTile(
    initialRowTile = 0,
    initialColumnTile,
    generatedNumber
  ) {
    //Set new highest value after checking
    grid.setHighestTileValue(tileImages[generatedNumber].number);

    let initialPosition = grid.getColumnCoordinates(
      initialRowTile,
      initialColumnTile
    );

    currentDroppingTile = new NumberTile(
      initialPosition.x,
      initialPosition.y,
      level.tilewidth,
      level.tileheight,
      tileImages[generatedNumber].number,
      tileImages[generatedNumber].texture
    );

    let destinationTile =
      grid.checkColumnAndReturnLastEmptyTile(initialColumnTile);

    currentDroppingTile.setDestinationY(destinationTile.y);

    currentDroppingTile.setRowAndCol(destinationTile.row, destinationTile.col);

    app.stage.addChild(currentDroppingTile);

    activeTickers.number += 1;

    removeTickerBlockFall = () => tickerBlockFall.remove(middle);

    function middle(delta) {
      currentDroppingTile.moveDown(
        delta,
        () => {
          tickerBlockFall.remove(middle);
          removeTickerBlockFall = null;
        },
        activeTickers,
        (row, col) => {
          grid.setNumberToTile(
            tileImages[generatedNumber].number,
            currentDroppingTile,
            row,
            col
          );

          //Making it null to disable block from being moved to another column eventhough dropping animation is over
          currentDroppingTile = null;
        },
        (row, col) => grid.checkIfNeighbourTilesAreSame(row, col),
        () => grid.removeClusters(),
        () => grid.calculateTileShift(),
        () => addNewTileToGameLevel(),
        () => grid.shiftTiles(),
        () => grid.printMatrix()
      );
    }

    tickerBlockFall.start();
    tickerBlockFall.add(middle);
  }

  function generateNewMergedTile(
    initialRowTile = 0,
    initialColumnTile,
    generatedNumber
  ) {
    // console.log('merged tile', tileImages[generatedNumber].number);
    //Set new highest value after checking
    grid.setHighestTileValue(tileImages[generatedNumber].number);

    let initialPosition = grid.getColumnCoordinates(
      initialRowTile,
      initialColumnTile
    );

    let droppingMergedTile = new NumberTile(
      initialPosition.x,
      initialPosition.y,
      level.tilewidth,
      level.tileheight,
      tileImages[generatedNumber].number,
      tileImages[generatedNumber].texture
    );

    let destinationTile =
      grid.checkColumnAndReturnLastEmptyTile(initialColumnTile);

    droppingMergedTile.setDestinationY(destinationTile.y);

    droppingMergedTile.setRowAndCol(destinationTile.row, destinationTile.col);

    app.stage.addChild(droppingMergedTile);

    //add score when tiles are merged
    addScore(droppingMergedTile.number);

    activeTickers.number += 1;

    removeTickerMergeBlock = () => tickerMergedBlockFall.remove(middle);

    function middle(delta) {
      droppingMergedTile.moveDown(
        delta,
        () => {
          tickerMergedBlockFall.remove(middle);
          removeTickerMergeBlock = null;
        },
        activeTickers,
        (row, col) =>
          grid.setNumberToTile(
            tileImages[generatedNumber].number,
            droppingMergedTile,
            row,
            col
          ),
        (row, col) => grid.checkIfNeighbourTilesAreSame(row, col),
        () => grid.removeClusters(),
        () => grid.calculateTileShift(),
        () => addNewTileToGameLevel(),
        () => grid.shiftTiles(),
        () => grid.printMatrix()
      );
    }

    tickerMergedBlockFall.start();
    tickerMergedBlockFall.add(middle);
  }

  function tilesShiftingAnimation(
    shiftingTile,
    destinationTile,
    shiftTilesInMatrix,
    checkIfNeighbourTilesAreSame,
    removeClusters,
    calculateTileShift,
    shiftTiles
  ) {
    shiftingTile.setDestinationY(destinationTile.y);

    shiftingTile.setRowAndCol(destinationTile.row, destinationTile.col);

    activeTickers.number += 1;

    function middle(delta) {
      shiftingTile.shiftDown(
        delta,
        () => tickerBlockShift.remove(middle),
        activeTickers,
        shiftTilesInMatrix,
        checkIfNeighbourTilesAreSame,
        removeClusters,
        calculateTileShift,
        () => addNewTileToGameLevel(),
        shiftTiles,
        () => grid.printMatrix()
      );
    }

    tickerBlockShift.start();
    tickerBlockShift.add(middle);
  }

  //Add score
  function addScore(value) {
    score += value;

    scoreDisplay.innerHTML = score;
    finalScoreDisplay.innerHTML = score;

    rocketProgression();
  }

  function generateNewDroppingTileLoop() {
    //Only generate block when game is not paused, not over and no other block animations are running
    while (
      gameover === false &&
      gamePaused === false &&
      activeTickers.number === 0 &&
      (lightbulbPowerUp === null || lightbulbPowerUp === undefined)
    ) {
      generatedNumber = generateDroppingBlocksIndex();
      initialColumnTile = generateRandomTile();

      generateNewTile(0, initialColumnTile, generatedNumber);
    }
  }

  function generateRandomNumber() {
    return Math.floor(Math.random() * gameLevelTileImages.length);
  }

  function generateDroppingBlocksIndex() {
    if (
      !thunderCloudPowerUpClicked ||
      thunderCloudPowerUpClicked === null ||
      thunderCloudPowerUpClicked === undefined
    ) {
      return generateRandomNumber();
    } else {
      return sameBlockIndex;
    }
  }

  function generateRandomTile() {
    return Math.floor(Math.random() * level.columns);
  }

  function handlePointerDown(event) {
    //If block is set to position in a tile then dont move it upon click
    if (currentDroppingTile !== null && currentDroppingTile !== undefined) {
      const gridCoordinates = getMouseToken(
        event.data.global.x,
        event.data.global.y
      );

      let newColumnCoordinates = grid.getColumnCoordinates(
        gridCoordinates.row,
        gridCoordinates.column
      );

      let destinationTile = grid.checkColumnAndReturnLastEmptyTile(
        gridCoordinates.column
      );

      currentDroppingTile.setHeadingDestination(
        newColumnCoordinates.x,
        destinationTile.y,
        destinationTile.row,
        destinationTile.col
      );
    }
  }

  // Get the tile under the mouse
  function getMouseToken(posX, posY) {
    // Calculate the index of the tile
    var tx = Math.floor((posX - level.x) / level.tilewidth);
    var ty = Math.floor((posY - level.y) / level.tileheight);

    //Rightmost grid clicks return value 5. To make it stay within grid limits
    if (tx === 5) {
      tx = tx - 1;
    }

    // Check if the tile is valid
    if (tx >= 0 && tx < level.columns && ty >= 0 && ty < level.rows) {
      // Tile is valid
      return {
        valid: true,
        column: tx,
        row: ty,
      };
    }

    // No valid tile
    return {
      valid: false,
      column: 0,
      row: 0,
    };
  }
};
