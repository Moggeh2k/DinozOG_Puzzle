
addEventListener("DOMContentLoaded", () => {
    console.log("DOm loaded");
  
    const myPuzzle = new PicturePuzzle(
      document.querySelectorAll("#puzzle-wrapper > div")[0],
      "full2.jpg",
      600
    );
  
     const picturePuzzle2 = new PicturePuzzle(
       document.querySelectorAll('#puzzle-wrapper > div')[1],
       'full4.jpg',
       600,
       4
     );
  
    myPuzzle.onSwap = function (movements) {
      console.log(movements);
    };
  
    const modal = document.querySelector("#success-modal");
    modal.style.display = "block";
  
    myPuzzle.onFinished = function () {
      console.log("Show good job dialog");
  
      setTimeout(() => {
        modal.classList.add("open");
        this.el.classList.add("blur-it");
      }, 500);
      modal.querySelector(".trigger").onclick = () => {
        modal.classList.remove("open");
        this.el.classList.remove("blur-it");
      };
    };
  });
  

class Cell {
    constructor(puzzle, index) {
  
      this.isEmpty = false;
      this.index = index;
      this.puzzle = puzzle;
      this.width = this.puzzle.width / this.puzzle.dimmension;
      this.height = this.puzzle.height / this.puzzle.dimmension;
  
      this.el = this.createDiv();
      puzzle.el.appendChild(this.el);
  
      if (this.index === this.puzzle.dimmension * this.puzzle.dimmension - 1) {
        this.isEmpty = true;
        return;
      }
      this.setImage();
      this.setPosition(this.index);
    }
  
    createDiv() {
      const div = document.createElement('div');
      div.style.backgroundSize = `${this.puzzle.width}px ${this.puzzle.height}px`;
      div.style.border = '1px solid #E5E5E5';
      div.style.position = 'absolute';
  
      div.onclick = () => {
  
        const currentCellIndex = this.puzzle.findPosition(this.index);
        const emptyCellIndex = this.puzzle.findEmpty();
        const {x, y} = this.getXY(currentCellIndex);
        const {x: emptyX, y: emptyY} = this.getXY(emptyCellIndex);
        if ((x === emptyX || y === emptyY) &&
          (Math.abs(x - emptyX) === 1 || Math.abs(y - emptyY) === 1)) {
          this.puzzle.numberOfMovements++;
          if (this.puzzle.onSwap && typeof this.puzzle.onSwap === 'function') {
            this.puzzle.onSwap(this.puzzle.numberOfMovements);
          }
          this.puzzle.swapCells(currentCellIndex, emptyCellIndex, true);
        }
      };
  
      return div;
    }
  
    setImage() {
      const {x, y} = this.getXY(this.index);
      const left = this.width * x;
      const top = this.height * y;
  
      this.el.style.width = `${this.width}px`;
      this.el.style.height = `${this.height}px`;
  
      this.el.style.backgroundImage = `url(${this.puzzle.imageSrc})`;
      this.el.style.backgroundPosition = `-${left}px -${top}px`;
    }
  
    setPosition(destinationIndex, animate, currentIndex) {
      const {left, top} = this.getPositionFromIndex(destinationIndex);
      const {left: currentLeft, top: currentTop} = this.getPositionFromIndex(currentIndex);
  
      if (animate) {
        if (left !== currentLeft) {
          this.animate('left', currentLeft, left);
        } else if (top !== currentTop) {
          this.animate('top', currentTop, top);
        }
      } else {
        this.el.style.left = `${left}px`;
        this.el.style.top = `${top}px`;
      }
    }
  
    animate(position, currentPosition, destination) {
      const animationDuration = 300;
      const frameRate = 10;
      let step = frameRate * Math.abs((destination - currentPosition)) / animationDuration;
  
      let id = setInterval(() => {
        if (currentPosition < destination) {
          currentPosition = Math.min(destination, currentPosition + step);
          if (currentPosition >= destination) {
            clearInterval(id)
          }
        } else {
          currentPosition = Math.max(destination, currentPosition - step);
          if (currentPosition <= destination) {
            clearInterval(id)
          }
        }
  
  
        this.el.style[position] = currentPosition + 'px';
      }, frameRate)
    }
  
    getPositionFromIndex(index) {
      const {x, y} = this.getXY(index);
      return {
        left: this.width * x,
        top: this.height * y
      }
    }
  
    getXY(index) {
      return {
        x: index % this.puzzle.dimmension,
        y: Math.floor(index / this.puzzle.dimmension)
      }
    }
  }
  

class PicturePuzzle {
  constructor(el, imageSrc, width, dimmension = 3) {
    this.parentEl = el;
    this.dimmension = dimmension;
    this.imageSrc = imageSrc;
    this.width = width;
    this.cells = [];
    this.shuffling = false;
    this.numberOfMovements = 0;

    this.onFinished = () => {};
    this.onSwap = () => {};

    this.init();
    const img = new Image();
    img.onload = () => {
      console.log(img.width, img.height);
      this.height = img.height * this.width / img.width;
      this.el.style.width = `${this.width}px`;
      this.el.style.height = `${this.height}px`;

      this.setup();
    };
    img.src = this.imageSrc;
  }

  init() {
    this.el = this.createWrapper();
    this.parentEl.appendChild(this.el);
  }

  createWrapper() {
    const div = document.createElement('div');
    div.style.position = 'relative';
    div.style.margin = ' 0 auto';
    return div;
  }

  setup() {
    for (let i = 0; i < this.dimmension * this.dimmension; i++) {
      this.cells.push(new Cell(this, i));
    }
    this.shuffle();
  }

  shuffle() {
    this.shuffling = true;
    for (let i = this.cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      this.swapCells(i, j);
    }
    this.shuffling = false;
  }

  swapCells(i, j, animate) {


    this.cells[i].setPosition(j, animate, i);
    this.cells[j].setPosition(i);
    [this.cells[i], this.cells[j]] = [this.cells[j], this.cells[i]];
    if (!this.shuffling && this.isAssembled()) {
      if (this.onFinished && typeof this.onFinished === 'function') {
        this.onFinished.call(this);
      }
    }
  }

  isAssembled() {
    for (let i = 0; i < this.cells.length; i++) {
      if (i !== this.cells[i].index) {
        if (i === 6 && this.cells[i].index === 8 && this.cells[i + 1].index === i + 1) {
          return true;
        }
        return false;
      }
    }
    return true;
  }

  findPosition(ind) {
    return this.cells.findIndex(cell => cell.index === ind);
  }

  findEmpty() {
    return this.cells.findIndex(cell => cell.isEmpty);
  }
}

window.PicturePuzzle = window.PicturePuzzle || PicturePuzzle;
