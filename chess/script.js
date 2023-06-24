document.addEventListener("DOMContentLoaded", main);
function main() {
  class Piece {
    constructor(color, piece, coordinate) {
      this.color = color;
      this.piece = piece;
      this.coordinate = coordinate;
      this.moved = 0;
      this.enPassant = false;
    }
  }
  const squares = document.querySelectorAll(".squares");
  const start = document.getElementById("start");
  start.innerHTML = "Start";
  const types = ["pawn", "rook", "knight", "bishop", "queen", "king"];
  const pawnChoices = document.querySelectorAll("#pawnChoices");
  const choices = document.querySelectorAll("#choices");
  let pieces = [[], [], [], [], [], [], [], [], []];
  let hints = [];
  let white = true;
  let selectedPiece;
  let kings = {
    white:61,
    black:5,
  }
  let castleLeft = false;
  let castleRight = false;
  let blackTime =300;
  let whiteTime = 300;
  let firstMove = true;
  const blackClock = document.getElementById("blackClock");
  const whiteClock = document.getElementById("whiteClock");
  var timer = setInterval(countDown,1000);


  setBoard();
  start.addEventListener("click",startGame);

  function startGame() {
    start.removeEventListener("click",startGame);
    firstMove = false;
    start.innerHTML = "Restart";
    start.addEventListener("click",()=>{
      clearInterval(timer);
      location.reload();
    });
    resetHints();
    Turn();
  }
   function Turn() {
    console.log(`${white? "White":"Black"}s in check? ${Check()}`);
    resetHints();
    let prev = selectedPiece;
    let mate = [];
    pieces.flat().forEach(p => {
      if (p != undefined && p.color == (white?"white":"black")) {
        selectedPiece = p;
        hints = [];
        switch (selectedPiece.piece) {
          case "pawn":
            pawnMove();
            break;
          case "rook":
            rookMove();
            break;
          case "knight":
            knightMove();
            break;
          case "bishop":
            bishopMove();
            break;
          case "queen":
            bishopMove();
            rookMove();
            break;
          case "king":
            kingMove();
            break;
        }
        mate.push(...hints.filter(function (hint){
          return tryHint(hint);
        }));
          
      }
        
    });
    if (mate.length == 0) {
      Check()?CheckMate():Draw();
    }
    selectedPiece = prev;
    squares.forEach((square) => {
      square.addEventListener("click", clickSquare);
    });
  }
  function clickSquare(event) {
    resetHints();
    squares.forEach((square) => {
      square.removeEventListener("click", clickSquare);
    });
    const index = this.getAttribute("cellindex");
    selectedPiece = clickOnPiece(index);
    if (selectedPiece != undefined) {
      if (white && selectedPiece.color == "white") {
        this.style.backgroundColor = "rgba(100%, 100%, 0%, 1)";
        movePiece();

      }
      else if(!white && selectedPiece.color == "black"){
        this.style.backgroundColor = "rgba(100%, 100%, 0%, 1)";
        movePiece();
        
      }
      else{
        Turn();
      }
    }
    else{
      Turn();
    }
  }
  function movePiece() {
    switch (selectedPiece.piece) {
      case "pawn":
        pawnMove();
        break;
      case "rook":
        rookMove();
        break;
      case "knight":
        knightMove();
        break;
      case "bishop":
        bishopMove();
        break;
      case "queen":
        bishopMove();
        rookMove();
        break;
      case "king":
        kingMove();
        Check()? undefined : castling();
        break;
    }
    hints = hints.filter(function (hint){
      return tryHint(hint);
    });
    showHints();
    squares.forEach((square) => {
      square.addEventListener("click", move);
    });
  }
  function kingMove() { 
    let kingHints = [];
    let co = selectedPiece.coordinate;
    let sP = {
      y: co / 8 == 0 ? 1 : Math.ceil(co / 8),
      x: co % 8 == 0 ? 8 : co % 8,
    };

    if ((sP.y-1>=1&&sP.x-1>=1)&&(pieces[sP.y-1][sP.x-1] == undefined || pieces[sP.y-1][sP.x-1].color == (white?"black":"white")) ) {
      kingHints.push(co-9);
    }
    if ((sP.y-1>=1) && (pieces[sP.y-1][sP.x] == undefined || pieces[sP.y-1][sP.x].color == (white?"black":"white"))) {
      kingHints.push(co-8);
    }
    if ((sP.y-1>=1&&sP.x+1<=8) && (pieces[sP.y-1][sP.x+1] == undefined || pieces[sP.y-1][sP.x+1].color == (white?"black":"white")) ) {
      kingHints.push(co-7);
    }
    if ((sP.x-1>=1) && (pieces[sP.y][sP.x-1] == undefined || pieces[sP.y][sP.x-1].color == (white?"black":"white")) ) {
      kingHints.push(co-1);
    }

    if ((sP.x+1<=8) && (pieces[sP.y][sP.x+1] == undefined || pieces[sP.y][sP.x+1].color == (white?"black":"white")) ) {
      kingHints.push(co+1);
    }
    if ((sP.y+1<=8&&sP.x-1>=1) && (pieces[sP.y+1][sP.x-1] == undefined || pieces[sP.y+1][sP.x-1].color == (white?"black":"white")) ) {
      kingHints.push(co+7);
    }
    if ((sP.y+1<=8) && (pieces[sP.y+1][sP.x] == undefined || pieces[sP.y+1][sP.x].color == (white?"black":"white")) ) {
      kingHints.push(co+8);
    }
    if ((sP.y+1<=8&&sP.x+1<=8) && (pieces[sP.y+1][sP.x+1] == undefined || pieces[sP.y+1][sP.x+1].color == (white?"black":"white"))) {
      kingHints.push(co+9);
    }    
    hints.push(...kingHints);
  }
  function knightMove(){
    let co = selectedPiece.coordinate;
    let sP = {
      y: co / 8 == 0 ? 1 : Math.ceil(co / 8),
      x: co % 8 == 0 ? 8 : co % 8,
    };
    if ((sP.y-2>=1&&sP.x+1<=8)&&(pieces[sP.y-2][sP.x+1] == undefined || pieces[sP.y-2][sP.x+1].color == (selectedPiece.color == "white" ? "black" : "white"))) {
      hints.push(co-15);
    }
    if ((sP.y-2>=1&&sP.x-1>=1) && (pieces[sP.y-2][sP.x-1] == undefined || pieces[sP.y-2][sP.x-1].color == (selectedPiece.color == "white" ? "black" : "white"))) {
      hints.push(co-17);
    }

    if ((sP.y+1<=8&&sP.x-2>=1) && (pieces[sP.y+1][sP.x-2] == undefined || pieces[sP.y+1][sP.x-2].color == (selectedPiece.color == "white" ? "black" : "white"))) {
      hints.push(co+6);
    }
    if ((sP.y-1>=1&&sP.x-2>=1) && (pieces[sP.y-1][sP.x-2] == undefined || pieces[sP.y-1][sP.x-2].color == (selectedPiece.color == "white" ? "black" : "white"))) {
      hints.push(co-10);
    }

    if ((sP.y+2<=8&&sP.x-1>=1) && (pieces[sP.y+2][sP.x-1] == undefined || pieces[sP.y+2][sP.x-1].color == (selectedPiece.color == "white" ? "black" : "white"))) {
      hints.push(co+15);
    }
    if ((sP.y+2<=8&&sP.x+1<=8) && (pieces[sP.y+2][sP.x+1] == undefined || pieces[sP.y+2][sP.x+1].color == (selectedPiece.color == "white" ? "black" : "white"))) {
      hints.push(co+17);
    }

    if ((sP.y+1<=8&&sP.x+2<=8) && (pieces[sP.y+1][sP.x+2] == undefined || pieces[sP.y+1][sP.x+2].color == (selectedPiece.color == "white" ? "black" : "white"))) {
      hints.push(co+10);
    }
    if ((sP.y-1>=1&&sP.x+2<=8) && (pieces[sP.y-1][sP.x+2] == undefined || pieces[sP.y-1][sP.x+2].color == (selectedPiece.color == "white" ? "black" : "white"))) {
      hints.push(co-6);
    }
  }
  function bishopMove(){
    let co = selectedPiece.coordinate;
    let sP = {
      y: co / 8 == 0 ? 1 : Math.ceil(co / 8),
      x: co % 8 == 0 ? 8 : co % 8,
    };
    let forwardLeft = true;
    let backwardLeft = true;
    let forwardRight = true;
    let backwardRight = true;
    for (let i = 1; i < 7; i++) {
      if(forwardLeft && (sP.x-i>=1 && sP.y-i>=1) ){
        if(pieces[sP.y-i][sP.x-i] == undefined){
          hints.push(co-((i*8)+i));
        }
        else if(pieces[sP.y-i][sP.x-i].color == (selectedPiece.color == "white" ? "black" : "white")){
          hints.push(co-(i*8+i));
          forwardLeft = false;
        }
        else{forwardLeft = false;}
      }
      if(backwardLeft && (sP.y+i<=8 && sP.x-i>=1)){
        if(pieces[sP.y+i][sP.x-i] == undefined){
          hints.push(co+((i*8)-i));
        }
        else if(pieces[sP.y+i][sP.x-i].color == (selectedPiece.color == "white" ? "black" : "white")){
          hints.push(co+((i*8)-i));
          backwardLeft = false;
        }
        else{backwardLeft = false;}
      }
      if(forwardRight && sP.y-i>=1 && sP.x+i<=8){
        if(pieces[sP.y-i][sP.x+i] == undefined){
          hints.push(co-((i*8)-i));
        }
        else if(pieces[sP.y-i][sP.x+i].color == (selectedPiece.color == "white" ? "black" : "white")){
          hints.push(co-((i*8)-i));
          forwardRight = false;
        }
        else{forwardRight = false;}
      }
      if(backwardRight && sP.y+i<=8 && sP.x+i<=8){
        if(pieces[sP.y+i][sP.x+i] == undefined){
          hints.push(co+((i*8)+i));
        }
        else if(pieces[sP.y+i][sP.x+i].color == (selectedPiece.color == "white" ? "black" : "white")){
          hints.push(co+((i*8)+i));
          backwardRight = false;
        }
        else{backwardRight = false;}
      }
      
    }
  }
  function castling(){
    let co = selectedPiece.coordinate;
    if (selectedPiece.moved == 0 && clickOnPiece(co-4) != undefined && clickOnPiece(co-4).moved == 0) {
      if(clickOnPiece(co-3) == undefined && clickOnPiece(co-2) == undefined && clickOnPiece(co-1) == undefined){
        hints.unshift(co-4);
        castleLeft = true;
      }
    }
    if(selectedPiece.moved == 0 && clickOnPiece(co+3) != undefined && clickOnPiece(co+3).moved == 0){
      if(clickOnPiece(co+1) == undefined && clickOnPiece(co+2) == undefined){
        hints.unshift(co+3);
        castleRight = true;
      }
    }
  }
  function rookMove(){
    let co = selectedPiece.coordinate;
    let sP = {
      y: co / 8 == 0 ? 1 : Math.ceil(co / 8),
      x: co % 8 == 0 ? 8 : co % 8,
    };
    let backward = true;
    let forward = true;
    let right = true;
    let left = true;
    for (let i = 1; i <= 7; i++) {
      if(backward && (sP.y+i<=8)){
        if (pieces[sP.y+i][sP.x] == undefined) {
          hints.push(co+(i*8));
        }
        else if(pieces[sP.y+i][sP.x].color == (selectedPiece.color == "white" ? "black" : "white")){
          hints.push(co+(i*8));
          backward = false;
        }
        else{backward = false;}
      }
      
      if(forward && (sP.y-i>=1)){
        if (pieces[sP.y-i][sP.x] == undefined) {
          hints.push(co-(i*8));
        }
        else if(pieces[sP.y-i][sP.x].color == (selectedPiece.color == "white" ? "black" : "white")){
          hints.push(co-(i*8));
          forward = false;
        }
        else{forward = false;}
      }
      if(right && (sP.x+i<=8)){
        if (pieces[sP.y][sP.x+i] == undefined) {
          hints.push(co+i);
        }
        else if(pieces[sP.y][sP.x+i].color == (selectedPiece.color == "white" ? "black" : "white")){
          hints.push(co+i);
          right = false;
        }
        else{right = false;}
      }
      if(left && (sP.x-i>=1)){
        if (( pieces[sP.y][sP.x-i] == undefined)) {
        hints.push(co-i);
        }
        else if(pieces[sP.y][sP.x-i].color == (selectedPiece.color == "white" ? "black" : "white")){
          hints.push(co-i);
          left = false;
        }
        else{left = false;}
      }
    }
  }
  function pawnTake(){
    let co = selectedPiece.coordinate;
    let sP = {
      y: co / 8 == 0 ? 1 : Math.ceil(co / 8),
      x: co % 8 == 0 ? 8 : co % 8,
    };
    if (selectedPiece.color == "white") {
      if (sP.x-1>=1 && sP.y-1>=1) {
        hints.push(co-9)
      }
      if(sP.x+1<=8 && sP.y-1>=1){
        hints.push(co-7);
      }
    }
    else{
      if (sP.y+1<=8 && sP.x-1>=1) {
        hints.push(co+7)
      }
      if(sP.y+1<=8 && sP.x+1<=8){
        hints.push(co+9);
      }
    }
  }
  function pawnMove() {
    
    let co = selectedPiece.coordinate;
    let sP = {
      y: co / 8 == 0 ? 1 : Math.ceil(co / 8),
      x: co % 8 == 0 ? 8 : co % 8,
    };
    if (selectedPiece.color == "white") {
      if (pieces[sP.y - 1][sP.x] == undefined) {
        hints.push(co - 8);
      }
      if (co < 67 && co > 48 && pieces[sP.y-1][sP.x] == undefined && pieces[sP.y-2][sP.x] == undefined) {
        hints.push(co - 16);
        
      }
      pawnTake();
      let count = hints.length-1;
      if (hints.includes(co-9) && (pieces[sP.y-1][sP.x-1] == undefined || pieces[sP.y-1][sP.x-1].color == "white")) {
        if(pieces[sP.y][sP.x-1] == undefined || pieces[sP.y][sP.x-1].color == "white" || !pieces[sP.y][sP.x-1].enPassant){
          sP.x == 8 ? hints.pop() : hints.splice(count-1,1);
        }
      }
      if(hints.includes(co-7) && (pieces[sP.y-1][sP.x+1] == undefined || pieces[sP.y-1][sP.x+1].color == "white")) {
        if(pieces[sP.y][sP.x+1] == undefined || pieces[sP.y][sP.x+1].color == "white" || !pieces[sP.y][sP.x+1].enPassant){
          hints.pop();
        }
      }
    }
    else{
      if (pieces[sP.y + 1][sP.x] == undefined) {
        hints.push(co + 8);
      }
      if (co < 17 && co > 8 && pieces[sP.y+1][sP.x] == undefined && pieces[sP.y+2][sP.x] == undefined) {
        hints.push(co + 16);
      }
      pawnTake();
      let count = hints.length-1;
      if(hints.includes(co+7) && (pieces[sP.y+1][sP.x-1] == undefined || pieces[sP.y+1][sP.x-1].color == "black")) {
        if(pieces[sP.y][sP.x-1] == undefined || pieces[sP.y][sP.x-1].color == "black" || !pieces[sP.y][sP.x-1].enPassant){
          sP.x == 8 ? hints.pop() : hints.splice(count-1,1);
        }
      }
      if (hints.includes(co+9) && (pieces[sP.y+1][sP.x+1] == undefined || pieces[sP.y+1][sP.x+1].color == "black")) {
        if(pieces[sP.y][sP.x+1] == undefined || pieces[sP.y][sP.x+1].color == "black" || !pieces[sP.y][sP.x+1].enPassant){
          hints.pop();
        }
      }
    }
  }
  function pawnAtLastRow(){
      return new Promise((resolve) =>{
        function handleClick(){
          let pieceName = this.classList[0];
          resolve(pieceName);
          choices.forEach(c =>{
            c.removeEventListener("click",handleClick);
          })
        }
        choices.forEach(piece => {
          piece.addEventListener("click",handleClick);
        });
      });
    }
  function Check(){
    let defaultHints = hints;
    hints = [];
    let prev = selectedPiece;
    
    pieces.flat().forEach(piece =>{
      if(piece != undefined && piece.color == (white ? "black" : "white")){
          selectedPiece = piece;
          switch (piece.piece) {
            case "pawn":
              pawnTake();break;
            case "rook":
              rookMove();break;
            case "knight":
              knightMove();break;
            case "bishop":
              bishopMove();break;
            case "queen":
              bishopMove();
              rookMove();
              break;
          }
      }
    });
    const result= white? hints.includes(Number(kings.white)):hints.includes(Number(kings.black));    
    selectedPiece = prev;
    hints = defaultHints;
    return result;
  }
  async function move(){
    squares.forEach((square) => {
      square.removeEventListener("click", move);
    });
    let index = this.getAttribute("cellIndex");
    let co = selectedPiece.coordinate;
    let sP = {
      y: co / 8 == 0 ? 1 : Math.ceil(co / 8),
      x: co % 8 == 0 ? 8 : co % 8,
    };
     if (hints.includes(Number(index))) {
      if (clickOnPiece(index) != undefined && (selectedPiece.piece == "king" && clickOnPiece(index).piece == "rook" && clickOnPiece(index).color == (white?"white":"black"))) {
        let takenPiece = clickOnPiece(index);
        let left = co>takenPiece.coordinate;
        if (left) {
          let king = pieces[sP.y][sP.x];
          let rook = pieces[sP.y][sP.x-4]
          pieces[sP.y][sP.x-2] = king;
          pieces[sP.y][sP.x-1] = rook;
          pieces[sP.y][sP.x] = undefined;
          pieces[sP.y][sP.x-4] = undefined;
  
          white? kings.white = co-2 : kings.black = co-2;
          pieces[sP.y][sP.x-2].coordinate = co-2
          pieces[sP.y][sP.x-1].coordinate = co-1;
          pieces[sP.y][sP.x-2].moved = 1
          pieces[sP.y][sP.x-1].moved = 1;
        }
        else{
          let king = pieces[sP.y][sP.x];
          let rook = pieces[sP.y][sP.x+3]
          pieces[sP.y][sP.x+2] = king;
          pieces[sP.y][sP.x+1] = rook;
          pieces[sP.y][sP.x] = undefined;
          pieces[sP.y][sP.x+3] = undefined;
  
          white? kings.white = co+2 : kings.black = co+2;
          pieces[sP.y][sP.x+2].coordinate = co+2
          pieces[sP.y][sP.x+1].coordinate = co+1;
          pieces[sP.y][sP.x+2].moved = 1
          pieces[sP.y][sP.x+1].moved = 1;
        }
        
        refreshImages();
        resetHints();
        squares[co-1].setAttribute("style",null);
        white = !white;
        
        Turn();
      }
      else{
        let newPlace = {
          y: Number(index / 8 == 0 ? 1 : Math.ceil(index / 8)),
          x: Number(index % 8 == 0 ? 8 : index % 8),
        };
        let old = pieces[sP.y][sP.x];
        if ((index <9 || index > 56) && selectedPiece.piece == "pawn"){
        let i = 5;
        pawnChoices.forEach(div =>{
          div.style.display = "flex";  
          if(!white){
            div.setAttribute("style",`grid-area: ${i}/1/${i}/1;display:flex`)
            div.firstChild.setAttribute("src",`./pictures/black${div.firstChild.classList[0]}.png`)
          }
          i+=1;
        })
        let p = await pawnAtLastRow();
        pieces[newPlace.y][newPlace.x] = new Piece(old.color,p,Number(index));
        pawnChoices.forEach(div => {
          div.style.display = "none";
        });
        
        }
        else{
          if (selectedPiece != undefined && selectedPiece.piece == "pawn" && clickOnPiece(co-1) != undefined && clickOnPiece(co-1).enPassant && index == (white?(co-9):(co+7))){
            pieces[sP.y][sP.x-1] = undefined;
          }
          else if(selectedPiece != undefined && selectedPiece.piece == "pawn" && (clickOnPiece(co+1) != undefined &&clickOnPiece(co+1).enPassant && index == (white?(co-7):(co+9)))){
            pieces[sP.y][sP.x+1] = undefined;
          }
          pieces[newPlace.y][newPlace.x] = old;
          pieces[newPlace.y][newPlace.x].coordinate = Number(index);
          pieces[newPlace.y][newPlace.x].moved= 1+pieces[newPlace.y][newPlace.x].moved;
          if (Math.abs(newPlace.y-sP.y) == 2 && selectedPiece.piece == "pawn") {
            if (pieces[newPlace.y][newPlace.x-1]!= undefined && pieces[newPlace.y][newPlace.x-1].color == (white?"black":"white")) {
              pieces[newPlace.y][newPlace.x].enPassant = true;
            }
            else if(pieces[newPlace.y][newPlace.x+1]!= undefined && pieces[newPlace.y][newPlace.x+1].color == (white?"black":"white")){
              pieces[newPlace.y][newPlace.x].enPassant = true;
            }
          }
        }
      
        pieces[sP.y][sP.x] = undefined;

        refreshImages();
        resetHints();
        squares[co-1].setAttribute("style",null);
        if(selectedPiece.piece == "king"){
          white ? kings.white = index : kings.black = index;
        }
        pieces.flat().filter(p =>{
          p!=undefined && p.piece == "pawn";
        }).forEach(pawn=>{
          pawn.enPassant = false;
        })
        white = !white;
        refreshImages();
        Turn();
      }
    }
    else{
      resetHints();
      const selectedPiece2 = clickOnPiece(index);
      if (selectedPiece2 != undefined && selectedPiece2 != selectedPiece) {
        if (white && selectedPiece2.color == "white") {
            this.style.backgroundColor = "rgba(100%, 100%, 0%, 1)";
            squares[selectedPiece.coordinate-1].setAttribute("style",null);
            selectedPiece = selectedPiece2;
            movePiece(selectedPiece2);
        }
        else if(!white && selectedPiece2.color == "black"){
          this.style.backgroundColor = "rgba(100%, 100%, 0%, 1)";
          squares[selectedPiece.coordinate-1].setAttribute("style",null);
          selectedPiece = selectedPiece2;
          movePiece(selectedPiece2);
        }
        else{
          squares[selectedPiece.coordinate-1].setAttribute("style",null);
          Turn();
        }
      }
      else{
        squares[selectedPiece.coordinate-1].setAttribute("style",null);
        Turn();
      }
    }
  }
  function tryHint(index) {
    let takenPiece = clickOnPiece(index);
    let co = selectedPiece.coordinate;
    let sP = {
      y: co / 8 == 0 ? 1 : Math.ceil(co / 8),
      x: co % 8 == 0 ? 8 : co % 8,
    };
    let okay;
    
    if (castleLeft) {
      let king = pieces[sP.y][sP.x];
      let rook = pieces[sP.y][sP.x-4]
      pieces[sP.y][sP.x-2] = king;
      pieces[sP.y][sP.x-1] = rook;
      pieces[sP.y][sP.x] = undefined;
      pieces[sP.y][sP.x-4] = undefined;

      white? kings.white = co-2 : kings.black = co-2;
      pieces[sP.y][sP.x-1].coordinate = co-1;
      okay = !(Check());

      pieces[sP.y][sP.x] = king;
      pieces[sP.y][sP.x-4] = rook;
      pieces[sP.y][sP.x-2] = undefined;
      pieces[sP.y][sP.x-1] = undefined;

      white? kings.white = co : kings.black = co;
      castleLeft = false;
      return okay;
    }
    else if (castleRight) {
      let king = pieces[sP.y][sP.x];
      let rook = pieces[sP.y][sP.x+3]
      pieces[sP.y][sP.x+2] = king;
      pieces[sP.y][sP.x+1] = rook;
      pieces[sP.y][sP.x] = undefined;
      pieces[sP.y][sP.x+3] = undefined;

      white? kings.white = co+2 : kings.black = co+2;
      pieces[sP.y][sP.x+1].coordinate = co+1;
      okay = !(Check());

      pieces[sP.y][sP.x] = king;
      pieces[sP.y][sP.x+3] = rook;
      pieces[sP.y][sP.x+2] = undefined;
      pieces[sP.y][sP.x+1] = undefined;

      white? kings.white = co : kings.black = co;
      castleRight = false;
      return okay;
    }
    else{
      let newPlace = {
        y: Number(index / 8 == 0 ? 1 : Math.ceil(index / 8)),
        x: Number(index % 8 == 0 ? 8 : index % 8),
      };
      let old = pieces[sP.y][sP.x];
      pieces[newPlace.y][newPlace.x] = new Piece(old.color,old.piece,Number(index));
      pieces[sP.y][sP.x] = undefined;
      if(selectedPiece.piece == "king"){
        white? kings.white = index : kings.black = index;
      }

      okay = !(Check());

      pieces[sP.y][sP.x] = old;
      pieces[newPlace.y][newPlace.x] = takenPiece;
      if(selectedPiece.piece == "king"){
        white? kings.white = co : kings.black = co;
      }
      return okay;
    }
  }
  function CheckMate(){
    console.log(white? "Black wins!": "White wins!");
    clearInterval(timer);
    squares.forEach((square)=>{
      square.removeEventListener("click",clickSquare);
    })
  }
  function Draw(){
    console.log("Draw");
    clearInterval(timer);
    squares.forEach((square)=>{
      square.removeEventListener("click",clickSquare);
    })
  }
  function showHints(){
    hints.forEach((element) => {
      if (clickOnPiece(element) != undefined && clickOnPiece(element).color == (white?"black":"white")) {
        squares[element - 1].classList.add("hint2");
      }
      else if(clickOnPiece(element) == undefined && element>8 && element<57 &&clickOnPiece(element+(white?8:(-8))) != undefined && clickOnPiece(element+(white?8:(-8))).enPassant == true){
        squares[element - 1].classList.add("hint2");
      }
      else{
        squares[element - 1].classList.add("hint");
      }  
    });
    
  }
  function resetHints(){
    hints.forEach((element) => {
      squares[element - 1].classList.remove("hint","hint2");
    });
    hints = [];
  }
  function clickOnPiece(squareIndex) {
    let x = squareIndex / 8 == 0 ? 1 : Math.ceil(squareIndex / 8);
    let y = squareIndex % 8 == 0 ? 8 : squareIndex % 8;
    let field = pieces[x][y];
    return field;
    
  }
  function refreshImages() {
    for (const piece in pieces) {
      pieces[piece].filter(notEmpty).forEach((p) => {
        squares[p.coordinate - 1].innerHTML = `<img src="pictures/${p.color}${p.piece}.png">`;
      });
    }

    for (let i = 1; i <= 8; i++) {
      for (let j = 1; j <= 8; j++) {
        if (pieces[i][j] == undefined) {
          squares[(i - 1) * 8 + (j - 1)].innerHTML = "";
        }
      }
    }
    function notEmpty(field) {
      return field != undefined;
    }
  }
  function setBoard() {
    types.forEach((element) => {
      switch (element) {
        case "pawn":
          for (let i = 1; i <= 8; i++) {
            pieces[7][i] = new Piece("white", "pawn", 6 * 8 + i);
            pieces[2][i] = new Piece("black", "pawn", 1 * 8 + i);
          }
          
        case "rook":
          pieces[8][1] = new Piece("white", element, 7 * 8 + 1);
          pieces[1][1] = new Piece("black", element, 0 * 8 + 1);
          pieces[8][8] = new Piece("white", element, 7 * 8 + 8);
          pieces[1][8] = new Piece("black", element, 0 * 8 + 8);
        case "knight":
          pieces[8][2] = new Piece("white", element, 7 * 8 + 2);
          pieces[1][2] = new Piece("black", element, 0 * 8 + 2);
          pieces[8][7] = new Piece("white", element, 7 * 8 + 7);
          pieces[1][7] = new Piece("black", element, 0 * 8 + 7);
        case "bishop":
          pieces[8][3] = new Piece("white", element, 7 * 8 + 3);
          pieces[1][3] = new Piece("black", element, 0 * 8 + 3);
          pieces[8][6] = new Piece("white", element, 7 * 8 + 6);
          pieces[1][6] = new Piece("black", element, 0 * 8 + 6);
        case "queen":
          pieces[8][4] = new Piece("white", element, 7 * 8 + 4);
          pieces[1][4] = new Piece("black", element, 0 * 8 + 4);
        case "king":
          pieces[8][5] = new Piece("white", element, 7 * 8 + 5);
          pieces[1][5] = new Piece("black", element, 0 * 8 + 5);
      }
    });
    squares.forEach((square) =>{
      let index = square.getAttribute("cellIndex");
      let col = index % 8 == 0 ? 8 : index % 8;
      let row = index / 8 == 0 ? 1 : Math.ceil(index / 8);
      square.setAttribute("style",`grid-area:${row}/${col}/${row}/${col}`);
    });
    refreshImages();
    whiteClock.innerHTML = toMinutes(whiteTime);
    blackClock.innerHTML = toMinutes(blackTime);
  }
  function toMinutes(t){
      let minutes = Math.floor(Number(t)/60);
      let seconds = (Number(t)%60)
      return `${minutes} : ${seconds/10<1?"0"+seconds:seconds}`;
    }
  function countDown(){
    
    if (!firstMove) {
      white?whiteTime--:blackTime--;
      white?whiteClock.innerHTML = toMinutes(whiteTime) : blackClock.innerHTML = toMinutes(blackTime);
    }
    if (whiteTime == 0 || blackTime == 0) {
      clearInterval(timer);
      alert(`Time's up! ${white?"Black":White} wins!"`);
    }
  }
  function shopPieces(){
    pieces.forEach(rows =>{
      console.log(rows);
    })
  }
}
