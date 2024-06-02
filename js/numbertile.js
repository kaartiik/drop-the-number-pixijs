class NumberTile extends PIXI.Sprite {
  constructor(x = 0, y = 0, width = 0, height = 0, number, imageURL) {
    super(imageURL);
    this.number = number;
    this.row = 0;
    this.column = 0;
    this.x = x;
    this.y = y;
    this.destinationY = 0;
    this.width = width;
    this.height = height;
  }

  status() {
    return 'x of tile is ' + this.x;
  }

  getRowAndColumn() {
    return { row: this.row, column: this.column };
  }

  setInitialPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setDestinationX(xVal) {
    this.x = xVal;
  }

  setHeadingDestination(xVal = 0, yVal = 0, row, col) {
    //check if the dropping tile is above the other tiles in the column and proceed
    if (this.y < yVal) {
      this.setDestinationY(yVal);
      this.setDestinationX(xVal);
      this.setRowAndCol(row, col);
    }
  }

  setDestinationY(yVal) {
    this.destinationY = yVal;
  }

  setRowAndCol(row, col) {
    this.row = row;
    this.column = col;
  }

  getRowAndCol() {
    return { row: this.row, column: this.column };
  }

  //destroy tile and change tile value
  destroyTile() {
    this.number = -2;
    super.destroy();
  }

  moveDown(
    delta,
    removeFn,
    activeTickersObj,
    setNumberToTile,
    checkNeighbours,
    removeClusters,
    calculateTileShift,
    addNewTileToGameLevel,
    shiftTiles,
    printMatrix
  ) {
    // use delta to create frame-independent transform
    let balance = this.destinationY - this.y;

    let balanceAbs = Math.abs(balance);
    if (balanceAbs >= 1) {
      this.y += (balance / balanceAbs) * 2;
    } else {
      this.y += balance;
      removeFn();
      if (setNumberToTile !== null) {
        setNumberToTile(this.row, this.column);
      }
      // printMatrix();
      checkNeighbours(this.row, this.column);
      removeClusters();
      calculateTileShift();
      shiftTiles();
      addNewTileToGameLevel();
      if (activeTickersObj.number - 1 >= 0) {
        activeTickersObj.number -= 1;
      } else {
        activeTickersObj.number = 0;
      }
    }
  }

  shiftDown(
    delta,
    removeFn,
    activeTickersObj,
    shiftTilesInMatrix,
    checkNeighbours,
    removeClusters,
    calculateTileShift,
    addNewTileToGameLevel,
    shiftTiles,
    printMatrix
  ) {
    // use delta to create frame-independent transform
    let balance = this.destinationY - this.y;

    let balanceAbs = Math.abs(balance);
    if (balanceAbs >= 1) {
      this.y += (balance / balanceAbs) * 2;
    } else {
      this.y += balance;
      removeFn();
      shiftTilesInMatrix();
      // printMatrix();
      checkNeighbours(this.row, this.column);
      addNewTileToGameLevel();
      activeTickersObj.number -= 1;

      // console.log('tile count', activeTickersObj.number);
      if (activeTickersObj.number === 0) {
        // console.log('last tile shifted');
        removeClusters();
      }
    }
  }

  //Used for end rocket fly animation
  disappearDown(yDistance) {
    this.y += yDistance;
  }
}
