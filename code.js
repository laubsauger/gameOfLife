var Game = function() {
    this.rows = 98;
    this.cols = 210;
    this.timerDelay = 25;
    this.playing = false;
};

Game.prototype = {
    initialize: function() {
        this.initializeGridState();
        this.initializeGridView(document.getElementById('gridContainer'), this.gridState);
        this.setupControls();
    },
    initializeGridView: function(container, gridState) {
        if (!container) {
            console.error('dom element not found: #gridContainer');
            return;
        }
        
        this.gridContainer = container;
        
        var table = document.createElement('table');
        
        for (var iRows = 0; iRows < this.rows; iRows++) {
            var tr = document.createElement('tr');

            for (var iCols = 0; iCols < this.cols; iCols++) {
                var cell = document.createElement('td');
                cell.setAttribute('id', iRows + '_' + iCols);
                cell.setAttribute('class', gridState[iRows][iCols] ? 'live newborn' : 'dead');
                tr.appendChild(cell);
            }
            table.appendChild(tr);
        }

        this.gridContainer.appendChild(table);
    },
    initializeGridState: function() {
        this.gridState = new Array(this.rows);
        this.nextGridState = new Array(this.rows);

        for (var iRows = 0; iRows < this.rows; iRows++) {
            this.gridState[iRows] = new Array(this.cols);
            this.nextGridState[iRows] = new Array(this.cols);
        }
    },
    resetGridState: function() {
        for (var iRows = 0; iRows < this.rows; iRows++) {
            for (var iCols = 0; iCols < this.cols; iCols++) {
                this.gridState[iRows][iCols] = 0; 
                this.nextGridState[iRows][iCols] = 0; 
            }
        }
    },
    updateGridView: function() {
        for (var iRows = 0; iRows < this.rows; iRows++) {
            for (var iCols = 0; iCols < this.cols; iCols++) {
                this.updateCellView(document.getElementById(iRows + '_' + iCols), this.updateCellState(iRows, iCols));
            }
        }
    },
    updateCellState: function(row, col) {
        this.gridState[row][col] = this.nextGridState[row][col];
        this.nextGridState[row][col] = 0;
        
        return this.gridState[row][col];
    },
    resetGridView: function() {
        var self = this;
        var liveCells = this.gridContainer.getElementsByTagName('td');
        
        Array.prototype.forEach.call(liveCells, function(cell) {
            self.updateCellView(cell, 0);
        });
    },
    updateCellView: function(cellElement, nextCellState) {
        var cellClass;

        if (nextCellState === 0) {
            cellClass = 'dead';
        } else if (nextCellState === 1) {
            cellClass = 'live newborn';
        } else {
            cellClass = 'live aged';
        }
        
        cellElement.setAttribute('class', cellClass);
    },
    setupControls: function() {
        this.startButton = document.getElementById('start');
        
        if (!this.startButton) {
            console.error('dom element not found: #start');
            return;
        }
        this.resetButton = document.getElementById('clear');
        
        if (!this.resetButton) {
            console.error('dom element not found: #clear');
            return;
        }
        
        this.randomButton = document.getElementById('random');
        
        if (!this.randomButton) {
            console.error('dom element not found: #random');
            return;
        }
    
        this.registerClickListener(this.gridContainer, this.cellClickHandler.bind(this));
        this.registerClickListener(this.startButton, this.startButtonClickHandler.bind(this));
        this.registerClickListener(this.resetButton, this.resetButtonClickHandler.bind(this));
        this.registerClickListener(this.randomButton, this.randomButtonClickHandler.bind(this));
    },
    registerClickListener: function(element, handler) {
        element.addEventListener('click', handler, false);
    },
    cellClickHandler: function(e) {
        if (e.target !== e.currentTarget && e.target.tagName === 'TD') {
            var cellIndex = e.target.getAttribute('id').split('_');
            this.gridState[cellIndex[0]][cellIndex[1]] = typeof this.gridState[cellIndex[0]][cellIndex[1]] === "undefined" || this.gridState[cellIndex[0]][cellIndex[1]] === 0 ? 1 : 0;
            this.updateCellView(e.target, this.gridState[cellIndex[0]][cellIndex[1]]);
        }
        
        e.stopPropagation();
    },
    startButtonClickHandler: function(e) {
        if (!this.playing) {
            this.start();
        } else {
            this.pause();
        }
    },
    resetButtonClickHandler: function(e) {
        this.reset();
    },
    randomButtonClickHandler: function(e) {
        this.reset();
        for (var iRows = 0; iRows < this.rows; iRows++) {
            for(var iCols = 0; iCols < this.cols; iCols++) {
                var cellState = this.getRandomInt(0, 2);
                this.nextGridState[iRows][iCols] = cellState;
            }
        }
        this.updateGridView();
    },
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    start: function() {
        console.log('Starting Game');
        this.startButton.textContent = 'pause';
        this.playing = true;
        this.play();
    },
    pause: function() {
        console.log('Pausing Game');
        this.startButton.textContent = 'continue';
        this.playing = false;
        clearTimeout(this.cachedInterval);
    },
    reset: function() {
        this.pause();
        
        console.log('Resetting Game');
        this.startButton.textContent = 'start';
        this.resetGridState();
        this.resetGridView();
    },
    play: function() {
        this.tick();
            
        if (this.playing) {
           setTimeout(this.play.bind(this), this.timerDelay);
        }
    },
    tick: function() {
        this.calculateNextGridState();
        this.updateGridView();
    },
    calculateNextGridState: function() {
        for (var iRows = 0; iRows < this.rows; iRows++) {
            for (var iCols = 0; iCols < this.cols; iCols++) {
                var nextCellState = this.getNextCellState(iRows, iCols);
                this.nextGridState[iRows][iCols] = nextCellState;
            }
        }
    },
    getNextCellState: function(row, col) {
        var cellState = this.gridState[row][col];
        var numAdjacentLivingCells = this.getNumberOfAdjacentLivingCells(row, col); 

        if (!cellState) {
            if (numAdjacentLivingCells === 3) {
                return 1;
            }
            
            return 0;
        }
        
        if (numAdjacentLivingCells < 2 || numAdjacentLivingCells > 3) {
            return 0;
        }
        
        if (numAdjacentLivingCells === 2 || numAdjacentLivingCells === 3) {
            return 2;
        }
        
        return 0;
    },
    getNumberOfAdjacentLivingCells: function(row, col) {
        var livingCells = 0;
        
        var neighbours = [
            [row - 1, col - 1], 
            [row, col - 1], 
            [row + 1, col - 1],
            [row - 1, col], 
            [row + 1, col],
            [row + 1, col + 1], 
            [row, col + 1], 
            [row - 1, col + 1]
        ];
        
        for (var i = 0; i < neighbours.length; i++) {
            if (neighbours[i][0] >= 0 && neighbours[i][1] >= 0 && neighbours[i][0] < this.rows && neighbours[i][1] < this.cols &&
                this.gridState[neighbours[i][0]][neighbours[i][1]] > 0
            ) {
                livingCells++;
            }
        }
    
        return livingCells;
    } 
};


window.onload = function() {
    (new Game()).initialize();
};
