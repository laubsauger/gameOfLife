var Game = function() {
    this.rows = 100;
    this.cols = 200;
    this.cellWidth = 7;
    this.cellHeight = 7;
    this.timerDelay = 500;
    this.playing = false;
    this.dragging = false;
    this.cellElements = [];
    this.CONST = {
        state: {
            alive: 1,
            dead: 0,
            // aged: 2,
            aliveNext: 3,
            deadNext: 4
        },
        rules: {
            underpopulationThreshold: 2,
            overpopulationThreshold: 3
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
        
        this.resetGridState();
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
                var nextCellState = this.nextGridState[iRows][iCols];
                
                if (this.gridState[iRows][iCols] !== nextCellState) {
                    this.updateCellView(this.cellElements[iRows + '_' + iCols], nextCellState);
                    this.gridState[iRows][iCols] = nextCellState;
                }
                
                // this.nextGridState[iRows][iCols] = 0;
            }
        }
    },
    updateCellView: function(cellElement, cellState) {
        // collection for each state
        // apply class in bulk
        
        cellElement.className = this.getCellClassByState(cellState);
    },
    resetGridView: function() {
        var self = this;
        var liveCells = this.gridContainer.getElementsByTagName('td');
        
        Array.prototype.forEach.call(liveCells, function(cell) {
            self.updateCellView(cell, 0, 0);
        });
    },
    getCellClassByState: function(cellState) {
        switch(cellState) {
            case this.CONST.state.dead: 
                return 'dead';
            case this.CONST.state.deadNext:
                return 'live newborn dead--next';
            case this.CONST.state.alive: 
                return 'live newborn';
            case this.CONST.state.aliveNext:
                return 'dead newborn--next';
            default:
                throw Error('next cell state has no corresponding class: ' + JSON.stringify(cellState));
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
            var nextCellState = this.getFutureCellState(this.gridState[cellIndex[0]][cellIndex[1]], this.getNumberOfAdjacentLivingCells(this.getNeighbours(cellIndex[0], cellIndex[1]), this.gridState));

            this.gridState[cellIndex[0]][cellIndex[1]] = nextCellState;
            this.updateCellView(e.target, nextCellState);
            
            
            //@todo: durch nachbarn rödeln und future cell state visualisieren
            // var neighbours = this.getNeighbours(cellIndex[0], cellIndex[1]);
            
            // for (var i = 0; i < neighbours.length; i++) {
            //     var neighbourRow = neighbours[i][0];
            //     var neighbourCol = neighbours[i][1];
                
            //     if (neighbourRow < 0 || neighbourCol < 0 || neighbourRow >= this.rows || neighbourCol >= this.cols) {
            //         // out of bounds
            //         continue;
            //     }
                
            //     var neighbourCurrentState = this.coerceState(this.gridState[neighbourRow][neighbourCol]);
            //     if (neighbourCurrentState !== this.CONST.state.alive && neighbourCurrentState !== this.CONST.state.dead) {
            //         continue;
            //     }
                
            //     var neighbourNextCellState = this.getFutureCellState(this.coerceState(this.gridState[neighbourRow][neighbourCol]), this.getNumberOfAdjacentLivingCells(this.getNeighbours(neighbourRow, neighbourCol), this.gridState, neighbourRow, neighbourCol));
                
            //     console.log(neighbourNextCellState);
            //     this.updateCellView(this.cellElements[neighbourRow + '_' + neighbourCol], this.gridState[neighbourRow][neighbourCol], neighbourNextCellState);
            //     this.gridState[neighbourRow][neighbourCol] = neighbourNextCellState;
            // }
        }
        
        e.stopPropagation();
    },
    coerceState: function(state) {
        return typeof state === "undefined" || state === this.CONST.state.dead ? this.CONST.state.alive : this.CONST.state.dead;
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
                var nextCellState = this.getNextCellState(this.gridState[iRows][iCols], this.getNumberOfAdjacentLivingCells(this.getNeighbours(iRows, iCols), this.gridState))
                
                if (nextCellState !== this.gridState[iRows][iCols]) {
                    tempGridState[iRows][iCols] = nextCellState;
                }
            }
        }
        
        // calculate again to find future state (used for visualizing next tick (aliveNext, deadNext states)
        for (var iRows = 0; iRows < this.rows; iRows++) {
            for (var iCols = 0; iCols < this.cols; iCols++) {
                if (typeof tempGridState[iRows][iCols] === "undefined") {
                    continue;
                }
                
                this.nextGridState[iRows][iCols] = this.getFutureCellState(tempGridState[iRows][iCols], this.getNumberOfAdjacentLivingCells(this.getNeighbours(iRows, iCols), tempGridState));
            }
        }
    },
    getNextCellState: function(cellState, numAdjacentLivingCells) {
        if (cellState === this.CONST.state.aliveNext) {
            cellState = this.CONST.state.dead;
        }
        
        if (cellState === this.CONST.state.deadNext) {
            cellState = this.CONST.state.alive;
        }
        
        if (cellState === this.CONST.state.alive) {
            if (numAdjacentLivingCells === this.CONST.rules.underpopulationThreshold || numAdjacentLivingCells === this.CONST.rules.overpopulationThreshold) {
                return this.CONST.state.alive;
            }
        }
        
        if (cellState === this.CONST.state.dead && numAdjacentLivingCells === this.CONST.rules.overpopulationThreshold) {
            return this.CONST.state.alive;
        }

        return this.CONST.state.dead;
    },
    getFutureCellState: function(cellState, numAdjacentLivingCells) {
        if (cellState === this.CONST.state.alive) {
            if (numAdjacentLivingCells < this.CONST.rules.underpopulationThreshold || numAdjacentLivingCells > this.CONST.rules.overpopulationThreshold) {
                return this.CONST.state.deadNext;
            }
        }
        
        if (cellState === this.CONST.state.dead) {
            if (numAdjacentLivingCells === this.CONST.rules.overpopulationThreshold) {
                return this.CONST.state.aliveNext;
            }
        }
        
        return cellState;
    },
    getNumberOfAdjacentLivingCells: function(neighbours, gridState) {
        var livingCells = 0;

        for (var i = 0; i < neighbours.length; i++) {
            var neighbourRow = neighbours[i][0];
            var neighbourCol = neighbours[i][1];
            
            if (neighbourRow < 0 || neighbourCol < 0 || neighbourRow >= this.rows || neighbourCol >= this.cols) {
                // out of bounds
                continue;
            }
            
            var neighbourCellState = gridState[neighbourRow][neighbourCol]; 
            
            if (neighbourCellState === this.CONST.state.alive || neighbourCellState === this.CONST.state.deadNext) {
                livingCells++;
            }
            
            if (livingCells > this.CONST.rules.overpopulationThreshold) {
                return livingCells;
            }
        }
    
        return livingCells;
    },
    getNeighbours: function(row, col) {
        return [
            [row - 1, col - 1], 
            [row, col - 1], 
            [row + 1, col - 1],
            [row - 1, col], 
            [row + 1, col],
            [row + 1, col + 1], 
            [row, col + 1], 
            [row - 1, col + 1]
        ];
    }
};


window.onload = function() {
    (new Game()).initialize();
};
