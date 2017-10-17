var Game = function() {
    this.rows = 64;
    this.cols = 64;
    this.cellWidth = 16;
    this.cellHeight = 16;
    this.timerDelay = 160;
    this.playing = false;
    this.dragging = false;
    this.cellElements = [];
    this.CONST = {
        state: {
            alive: 1,
            dead: 0,
            aged: 2,
            aliveNext: 3,
            deadNext: 4
        }    
    };
};

Game.prototype = {
    initialize: function() {
        this.initializeGridState();
        this.initializeGridView(document.getElementById('gridContainer'), this.gridState);
        this.setupControls();
    },
    initializeGridState: function() {
        this.gridState = new Array(this.rows);
        this.nextGridState = new Array(this.rows);

        for (var iRows = 0; iRows < this.rows; iRows++) {
            this.gridState[iRows] = new Array(this.cols);
            this.nextGridState[iRows] = new Array(this.cols);
        }
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
                cell.setAttribute('width', this.cellWidth);
                cell.setAttribute('height', this.cellHeight);
                tr.appendChild(cell);
                
                this.cellElements[iRows + '_' + iCols] = cell;
            }
            table.appendChild(tr);
        }

        this.gridContainer.appendChild(table);
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
                this.updateCellView(this.cellElements[iRows + '_' + iCols], this.gridState[iRows, iCols], this.updateCellState(iRows, iCols));
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
            self.updateCellView(cell, 0, 0);
        });
    },
    updateCellView: function(cellElement, cellState, nextCellState) {
        console.log('cellState', cellState, 'nextCellState', nextCellState);
        cellElement.setAttribute('class', this.getCellClassByState(cellState, nextCellState));
    },
    getCellClassByState: function(cellState, nextCellState) {
        switch(nextCellState) {
            case this.CONST.state.dead: 
                return 'dead';
            case this.CONST.state.deadNext:
                var baseClass = '';
                
                if (cellState === this.CONST.state.alive) {
                    baseClass = 'live newborn'
                }
                
                if (cellState === this.CONST.state.aged) {
                    baseClass = 'live aged';
                }
                
                return baseClass + ' dead--next';
            case this.CONST.state.alive: 
                return 'live newborn';
            case this.CONST.state.aliveNext:
                return 'newborn--next';
            case this.CONST.state.aged:
                return 'live aged';
            default:
                throw Error('next cell state has no corresponding class');
        }
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
        
        this.nextStepButton = document.getElementById('next-step');
        
        if (!this.nextStepButton) {
            console.error('dom element not found: #next-step');
            return;
        }
    
        this.registerClickListener(this.gridContainer, this.cellClickHandler.bind(this));
        //@TODO: this is not working
        // this.registerDragListener(this.gridContainer, this.leftMouseDragHandler.bind(this));
        
        this.registerClickListener(this.startButton, this.startButtonClickHandler.bind(this));
        this.registerClickListener(this.resetButton, this.resetButtonClickHandler.bind(this));
        this.registerClickListener(this.randomButton, this.randomButtonClickHandler.bind(this));
        this.registerClickListener(this.nextStepButton, this.nextStepButtonClickHandler.bind(this));
    },
    registerClickListener: function(element, handler) {
        element.addEventListener('click', handler, false);
    },
    registerDragListener: function(element, handler) {
        element.addEventListener('mousedown', (function(e) {
            this.dragging = true;
            
            if (e.target !== e.currentTarget && e.target.tagName === 'TD') {
                var startCellIndex = this.getCellIndex(e.target);
            }
            
            console.log(this.dragging, startCellIndex);
            
            e.stopPropagation();  
        }).bind(this), false);
        
        element.addEventListener('mousemove', handler, false);
        
        element.addEventListener('mouseup', handler, false);
    },
    cellClickHandler: function(e) {
        if (e.target !== e.currentTarget && e.target.tagName === 'TD') {
            var cellIndex = this.getCellIndex(e.target);
            
            var nextCellState = typeof this.gridState[cellIndex[0]][cellIndex[1]] === "undefined" || this.gridState[cellIndex[0]][cellIndex[1]] === this.CONST.state.dead ? this.CONST.state.alive : this.CONST.state.dead;
            
            this.updateCellView(e.target, this.gridState[cellIndex[0]][cellIndex[1]] || 0, nextCellState);
            this.gridState[cellIndex[0]][cellIndex[1]] = nextCellState;
        }
        
        e.stopPropagation();
    },
    getCellIndex: function(cellElement) {
          return cellElement.getAttribute('id').split('_');
    },
    //@TODO: implement me
    leftMouseDragHandler: function(e) {
        // if (e !== e.currentTarget && e.target.tagName === 'TD') {
        //     var startCellIndex = e.target.getAttribute('id').split('_');
        // } 
        
        // e.stopPropagation();  
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
    nextStepButtonClickHandler: function(e) {
        this.tick();
    },
    randomButtonClickHandler: function(e) {
        this.reset();
        for (var iRows = 0; iRows < this.rows; iRows++) {
            for(var iCols = 0; iCols < this.cols; iCols++) {
                var cellState = this.getRandomInt(0, 1);
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
        this.startButton.classList.add('running');
        this.startButton.classList.remove('paused');
        this.playing = true;
        this.play();
    },
    pause: function() {
        console.log('Pausing Game');
        this.startButton.textContent = 'continue';
        this.startButton.classList.add('paused');
        this.startButton.classList.remove('running');
        this.playing = false;
        clearTimeout(this.cachedInterval);
    },
    reset: function() {
        this.pause();
        
        console.log('Resetting Game');
        this.startButton.textContent = 'start';
        this.startButton.classList.remove('paused');
        this.startButton.classList.remove('running');
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
        var tempGridState = [];
        
        for (var iRows = 0; iRows < this.rows; iRows++) {
            tempGridState[iRows] = [];
            for (var iCols = 0; iCols < this.cols; iCols++) {
                var nextCellState = this.getNextCellState(this.gridState[iRows][iCols], this.getNumberOfAdjacentLivingCells(this.gridState, iRows, iCols), false);
                tempGridState[iRows][iCols] = nextCellState;
            }
        }
        
        this.nextGridState = tempGridState;
        
        // calculate again to find future state
        for (var iRows = 0; iRows < this.rows; iRows++) {
            for (var iCols = 0; iCols < this.cols; iCols++) {
                var nextCellState = this.getNextCellState(tempGridState, this.getNumberOfAdjacentLivingCells(tempGridState, iRows, iCols), true);
                this.nextGridState[iRows][iCols] = nextCellState;
            }
        }
    },
    getNextCellState: function(cellState, numAdjacentLivingCells, isPredictionPass) {
        // var deadState = this.CONST.state.dead;
        // var aliveState = this.CONST.state.alive;
        // var agedState = this.CONST.state.aged;
        
        // if (isPredictionPass) {
        //     deadState = this.CONST.state.deadNext;
        //     aliveState = this.CONST.state.aliveNext;
        // }
        
        if (cellState === this.CONST.state.dead) {
            if (numAdjacentLivingCells === 3) {
                if (isPredictionPass) {
                    return this.CONST.state.aliveNext    
                }
                
                return this.CONST.state.alive;
            }
            
            if (isPredictionPass) {
                return this.CONST.state.deadNext;
            }
            
            return this.CONST.state.dead;
        }
        
        if (numAdjacentLivingCells < 2 || numAdjacentLivingCells > 3) {
            if (isPredictionPass) {
                return this.CONST.state.deadNext;
            }
            
            return this.CONST.state.dead;
        }
        
        if (numAdjacentLivingCells === 2 || numAdjacentLivingCells === 3) {
            return this.CONST.state.aged;
        }
        
        if (isPredictionPass) {
            return this.CONST.state.deadNext;
        }
        
        return this.CONST.state.dead;
    },
    getNumberOfAdjacentLivingCells: function(gridState, row, col) {
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
            var neighbourRow = neighbours[i][0];
            var neighbourCol = neighbours[i][1];
            
            if (neighbourRow < 0 || neighbourCol < 0 || neighbourRow >= this.rows || neighbourCol >= this.cols) {
                // out of bounds
                continue;
            }
            
            var neighbourCellState = gridState[neighbourRow][neighbourCol]; 
            
            if (neighbourCellState === this.CONST.state.alive || neighbourCellState === this.CONST.state.aged) {
                livingCells++;
            }
        }
    
        return livingCells;
    }
};


window.onload = function() {
    (new Game()).initialize();
};
