class Grid {
  constructor(
    canvasWidth = 0,
    canvasHeight = 0,
    rows = 0,
    columns = 0,
    tilewidth = 0,
    startX = 0,
    startY = 0,
    highestTileValue = 0,
    availableTileImages = [],
    generateNewTile,
    addNewTileToGameLevel,
    activeTickers,
    tilesShiftingAnimation
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.rows = rows;
    this.columns = columns;
    this.tilewidth = tilewidth;
    this.startX = startX;
    this.startY = startY;
    this.highestTileValue = highestTileValue;
    this.highestTileValueRemoved = 0;
    this.cumulativeScoreAllBlocksRemoved = 0;
    //Each array within represents a row. Items within an array represents a column
    this.matrix = []; //{ type, numberTile, shift row, col, x, y};
    this.clusters = []; //[{row, column, tileValue, isDroppingTile},[...]]
    this.availableTileImages = availableTileImages;
    this.generateNewTile = generateNewTile;
    this.addNewTileToGameLevel = addNewTileToGameLevel;
    this.activeTickers = activeTickers;
    this.tilesShiftingAnimation = tilesShiftingAnimation;
    this.init();
  }

  init() {
    let yOffset = this.startY;
    // Initialize the two-dimensional tile array
    for (var row = 0; row < this.rows; row++) {
      if (row > 0) {
        yOffset += this.tilewidth;
      }

      this.matrix[row] = [];
      let xOffset = this.startX;
      for (var col = 0; col < this.columns; col++) {
        if (col > 0) {
          xOffset += this.tilewidth;
        }
        // Define a tile type and a shift parameter for animation
        this.matrix[row][col] = {
          type: -1,
          numberTile: null,
          shift: 0,
          row,
          col,
          x: xOffset,
          y: yOffset,
        };
      }
    }
  }

  getMatrix() {
    return this.matrix;
  }

  setHighestTileValue(value) {
    if (value > this.highestTileValue) {
      this.highestTileValue = value;
    }
  }

  getHighestTileValue() {
    return this.highestTileValue;
  }

  setHighestTileValueRemoved(value) {
    this.highestTileValueRemoved = value;
  }

  getHighestTileValueRemoved() {
    return this.highestTileValueRemoved;
  }

  getColumnCoordinates(row, column) {
    return this.matrix[row][column];
  }

  setNumberToTile(number, numberTileObj, row, col) {
    this.matrix[row][col].type = number;
    this.matrix[row][col].numberTile = numberTileObj;
  }

  getMax(a) {
    return Math.max(
      ...a.map((e) => (Array.isArray(e) ? this.getMax(e) : e.type))
    );
  }

  getScoreAllBlocksRemoved() {
    return this.cumulativeScoreAllBlocksRemoved;
  }

  removeAllBlocks() {
    let cumulativeScore = 0;

    for (var row = 0; row < this.rows; row++) {
      for (var col = 0; col < this.columns; col++) {
        if (
          this.matrix[row][col].type !== -1 &&
          this.matrix[row][col].type !== -2
        ) {
          cumulativeScore += this.matrix[row][col].type;
          this.removeBlock(row, col);
        }
      }
    }

    this.cumulativeScoreAllBlocksRemoved = cumulativeScore;
  }

  identifyLargestBlockToRemove() {
    let highestTile = this.getMax(this.matrix);
    let highestFound = false;
    this.highestTileValueRemoved = highestTile;
    // console.log('HIGHEST TILE VALUE', highestTile);

    for (var row = 0; row < this.rows; row++) {
      for (var col = 0; col < this.columns; col++) {
        if (this.matrix[row][col].type === highestTile) {
          this.removeBlock(row, col);
          highestFound = true;
          break;
        }
      }
      if (highestFound) break;
    }
  }

  removeBlock(row, column) {
    if (
      this.matrix[row][column].type !== -1 &&
      this.matrix[row][column].type !== -2
    ) {
      this.matrix[row][column].type = -2;
      this.matrix[row][column].numberTile.destroyTile();
      this.matrix[row][column].numberTile = null;
    }
  }

  checkColumnAndReturnLastEmptyTile(col) {
    for (var row = this.rows - 1; row >= 0; row--) {
      if (
        this.matrix[row][col].type === -1 ||
        this.matrix[row][col].type === -2
      ) {
        return this.matrix[row][col];
      }
    }
  }

  checkIfNeighbourTilesAreSame(row, col) {
    let tempClusters = [];
    if (
      this.matrix[row][col].type !== -1 &&
      this.matrix[row][col].type !== -2
    ) {
      if (row - 1 >= 0) {
        if (this.matrix[row - 1][col].type === this.matrix[row][col].type) {
          tempClusters.push({
            row: row - 1,
            column: col,
            tileValue: this.matrix[row - 1][col].type,
            isDroppingTile: false,
          });
        }
      }

      if (col - 1 >= 0) {
        if (this.matrix[row][col - 1].type === this.matrix[row][col].type) {
          tempClusters.push({
            row: row,
            column: col - 1,
            tileValue: this.matrix[row][col - 1].type,
            isDroppingTile: false,
          });
        }
      }

      if (row + 1 < this.rows) {
        if (this.matrix[row + 1][col].type === this.matrix[row][col].type) {
          tempClusters.push({
            row: row + 1,
            column: col,
            tileValue: this.matrix[row + 1][col].type,
            isDroppingTile: false,
          });
        }
      }

      if (col + 1 < this.columns) {
        if (this.matrix[row][col + 1].type === this.matrix[row][col].type) {
          tempClusters.push({
            row: row,
            column: col + 1,
            tileValue: this.matrix[row][col + 1].type,
            isDroppingTile: false,
          });
        }
      }

      if (tempClusters.length > 0) {
        let sameNumberCluster = [
          {
            row: row,
            column: col,
            tileValue: this.matrix[row][col].type,
            isDroppingTile: true,
          },
          ...tempClusters,
        ];
        this.clusters.push(sameNumberCluster);
      }
      // console.log('clusters', this.clusters);
    }
  }

  addTiles(tilesToBeMerged) {
    let valueOfDroppingTile = tilesToBeMerged[0].tileValue;

    for (var i = 1; i < tilesToBeMerged.length; i++) {
      let tileToMerge = tilesToBeMerged[i];
      let tileToMergeValue = tileToMerge.tileValue;
      valueOfDroppingTile += tileToMergeValue;
    }

    if (this.checkResultIsSquareOfTwo(valueOfDroppingTile)) {
      return { number: valueOfDroppingTile };
    } else {
      return this.availableTileImages.reduce((prev, curr) =>
        Math.abs(curr.number - valueOfDroppingTile) <=
        Math.abs(prev.number - valueOfDroppingTile)
          ? curr
          : prev
      );
    }
  }

  checkResultIsSquareOfTwo(n) {
    return Math.log2(n) % 1 === 0;
  }

  generateMergedTile(rowValue, columnValue, newValueOfDroppingTile) {
    const newTileIndex = this.availableTileImages.findIndex(
      (item) => item.number === newValueOfDroppingTile
    );
    this.generateNewTile(rowValue, columnValue, newTileIndex);
  }

  sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  // Shift tiles and insert new tiles
  async shiftTiles() {
    // Shift tiles
    for (let row = this.rows - 1; row >= 0; row--) {
      for (let col = 0; col < this.columns; col++) {
        let shift = this.matrix[row][col].shift;

        if (shift > 0) {
          /*console.log(
            'shifting',
            this.matrix[row][col].type,
            'to',
            row + shift,
            col
          );*/
          let shiftingTile = this.matrix[row][col].numberTile;
          let destinationTile = this.matrix[row + shift][col];

          //shift the tiles on the screen
          this.tilesShiftingAnimation(
            shiftingTile,
            destinationTile,
            () => this.shiftTilesInMatrix(row, col, row + shift, col),
            (row, col) => this.checkIfNeighbourTilesAreSame(row, col),
            () => this.removeClusters(),
            () => this.calculateTileShift(),
            () => this.shiftTiles()
          );
        }

        // Reset shift
        this.matrix[row][col].shift = 0;
      }
    }
  }

  shiftTilesInMatrix(initRow, initCol, destinationRow, destionationCol) {
    /*console.log(
      'tile swap',
      this.matrix[initRow][initCol].type,
      'to',
      this.matrix[destinationRow][destionationCol].type
    );*/
    const originalMatrixType = this.matrix[initRow][initCol].type;
    this.matrix[initRow][initCol].type =
      this.matrix[destinationRow][destionationCol].type;
    this.matrix[destinationRow][destionationCol].type = originalMatrixType;

    const originalMatrixNumberTile = this.matrix[initRow][initCol].numberTile;
    this.matrix[initRow][initCol].numberTile =
      this.matrix[destinationRow][destionationCol].numberTile;
    this.matrix[destinationRow][destionationCol].numberTile =
      originalMatrixNumberTile;
  }

  // Loop over the cluster tiles and execute a function
  loopClusters(func) {
    let tilesToBeMerged = []; //contains cluster
    for (var i = 0; i < this.clusters.length; i++) {
      let cluster = this.clusters[i];
      for (let blockCount = 0; blockCount < cluster.length; blockCount++) {
        //  { column, row, length, horizontal }
        var block = cluster[blockCount];

        tilesToBeMerged.push(block);

        func(block.row, block.column);
      }

      if (tilesToBeMerged.length > 0) {
        let droppingTile = tilesToBeMerged[0];
        let { number } = this.addTiles(tilesToBeMerged);
        this.generateMergedTile(droppingTile.row, droppingTile.column, number);
      }
    }
  }

  // Remove the clusters
  removeClusters() {
    // Change the type of the tiles to -1, indicating a removed tile
    this.loopClusters((row, column) => {
      if (
        this.matrix[row][column].type !== -1 &&
        this.matrix[row][column].type !== -2
      ) {
        this.matrix[row][column].type = -2;
        this.matrix[row][column].numberTile.destroyTile();
        this.matrix[row][column].numberTile = null;
      }
    });

    //Reset clusters after removed
    this.clusters = [];
  }

  //calculate the tile shift if there are any removed tiles
  calculateTileShift() {
    // Calculate how much a tile should be shifted downwards
    for (var col = 0; col < this.columns; col++) {
      var shift = 0;
      for (var row = this.rows - 1; row >= 0; row--) {
        // Loop from bottom to top
        if (this.matrix[row][col].type == -2) {
          // Tile is removed, increase shift
          shift++;
          this.matrix[row][col].shift = 0;
          //to prevent subsequent block shift calculations from includin the same tile
          this.matrix[row][col].type = -1;
        } else if (this.matrix[row][col].type !== -1) {
          // Set the shift
          this.matrix[row][col].shift = shift;
        }
      }
    }
  }

  printMatrix() {
    console.log('PRINT MATRIX');
    for (let row = 0; row < this.rows; row++) {
      let r = '';
      for (let col = 0; col < this.columns; col++) {
        r += ` ${this.matrix[row][col].type} `;
      }
      console.log(r);
      r = '';
    }
  }
}

// export default Grid;
