//drawing canvas
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

//adjusting the scale
ctx.scale(20,20);

//height and width of the canvas
const height = 400;
const width = 240;

//constructor player
var player ={
	pos : {x:0,y:0}, //for position of the player
	matrix:null,  //matrix used to create the piece
	score:0  //to keep record of the score
};

//creating a matrix to fit the drawing of shapes
function createMatrix(w,h){ //w-wide,h-height
	var matrix = []; //array matrix
	while(h--){   // till the time height is not equal to zero
		matrix.push(new Array(w).fill(0));
	}
	return matrix;
}

//arena as a matrix of 12 columns and 20 rows (track where shapes could be drawn)
var arena = createMatrix(12,20);

//creating pieces 
//0 in array indicates nothing to draw
//used different number in matrixes to provide indexes parallel to colors
function createPiece(type){
	if(type === 'T'){  //shape'T'
	    return	[
            [0,0,0],
	        [1,1,1],
	        [0,1,0]
        ];
	}else if (type === 'O'){  //shape'O'
		return [
		    [2,2],
			[2,2]
		];
	}else if (type === 'L'){   //shape'L'
		return [
		    [0,3,0],
			[0,3,0],
			[0,3,3]
		];
	}else if (type === 'J'){   //shapeJ'
		return [
		    [0,4,0],
			[0,4,0],
			[4,4,0]
		];
	}else if (type === 'I'){   //shape'I'
		return [
		    [0,5,0],
			[0,5,0],
			[0,5,0]
		];
	}else if (type === 'S'){  //shape'S'
		return [
		    [0,6,6],
			[6,6,0],
			[0,0,0]
		];
	}else if (type === 'Z'){   //shape'Z'
		return [
		    [7,7,0],
			[0,7,7],
			[0,0,0]
		];
	}
}

//for giving different colors to the pieces
var colors = [null,"red","blue","violet","green","yellow","orange","pink"];

//drawing pieces on canvas
function drawMatrix(matrix, offset){
    matrix.forEach(function(row,y) { //for each row of the matrix
	    row.forEach(function(value,x){ //for each value of row
		    if(value !==0){
			    ctx.fillStyle = colors[value];  //adding color to the piece
			    ctx.fillRect(x+offset.x,y+offset.y,1,1);//drawing piece on the position 
		    }
	    })
    });
}

//drawing matrix(simply,piece)
function draw(){
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.fillRect(0,0,width,height);
	drawMatrix(arena,{x:0,y:0});
    drawMatrix(player.matrix,player.pos);
}

//to detect the collide of the piece to the ground 
function collide(arena,player){
	var [m,o] = [player.matrix,player.pos];  //m for matrx, o for offset
	for(var y = 0; y < m.length ; y++){
		for(var x = 0 ;x < m[y].length ; x++){
			if(m[y][x]!==0 && (arena[y+o.y] &&  arena[y+o.y][x+o.x]) !==0){ //y as row of arena and matrix and x as column of arena and matrix
				return true;
			}
		}
	}
	return false;
}

//to count the score when a row gets cleared off
function arenaSweep(){
	var rowCount = 1 ;
	outer:for(var y = arena.length-1 ; y>0 ; y--){
		for(var x = 0; x<arena[y].length ; x++){
			if(arena[y][x] === 0){ // row is not yet populated and h row doesn't get cleared off
				continue outer ;
			}
		}
		//when a row is filled completely,it gets cleared off and score is updated
		var row = arena.splice(y,1)[0].fill(0); //calls an empty row
		arena.unshift(row); //puts in top of arena
		y++;
		//for score
		player.score += rowCount*10 ;
	}
}

//copying all values of player into arena at correct offset
function merge(arena,player){
	player.matrix.forEach(function(row,y){
		row.forEach(function(value,x){
		    if(value !==0){
				arena[y+player.pos.y][x+player.pos.x] = value;
			}
		});
	});
}

var dropCounter = 0 ;
var dropInterval = 1000;//taking 1 second as an interval to drop

//dropping the piece
 function playerDrop(){
	player.pos.y++;
	if(collide(arena,player)){  //resetting and drawing a piece from top again when the earlier piece touches the ground
		player.pos.y--;
		merge(arena,player);
		playerReset();
		arenaSweep(); //checks for row if filled 
		updateScore(); //updates the score
	}
    dropCounter = 0; 
 }

//drawing random pieces and updating score (basically inviting another piece after one touches the ground)
function playerReset(){
	var pieces = 'ILJOTSZ';
	//create piece of a random type
	player.matrix = createPiece(pieces[Math.floor(pieces.length * Math.random())]);
	player.pos.y = 0;
	player.pos.x = (Math.floor(arena[0].length/2)-Math.floor(player.matrix[0].length/2));
	
	//when all the pieces are blocked to the top 
	if(collide(arena,player)){
	    alert("You scored " + player.score + " !"); //giving user the final score
		alert("Restart.."); //if user wants to restart the game
		arena.forEach(function(row){
		    row.fill(0);
		    player.score = 0;
		    updateScore();
		});
	}
}

//change direction of piece
function playerMove(dir){
    player.pos.x += dir;
	if(collide(arena,player)){
		player.pos.x -= dir;
	}
}

//rotating the piece
function playerRotate(dir){
	var pos = player.pos.x;
	var offset = 1;
	rotate(player.matrix,dir);
	while(collide(arena,player)){ //used for nt to rotate the piece in the canvas
		player.pos.x += offset;
		offset = -(offset + (offset > 0 ? 1: -1));
		if(offset > player.matrix[0].length){
			rotate(player.matrix, -dir);
			player.pos.x = pos;
			return;
		}
	}
}

//rotate the matrix
function rotate(matrix,dir){
    for(var y = 0 ; y < matrix.length ; y++){
		for(var x = 0 ; x < y ; x++){
			[ matrix[x][y],matrix[y][x]] = [matrix[y][x],matrix[x][y]];
		}
	}
	if(dir > 0){
		matrix.forEach(function (row) {
			row.reverse();
		});
	}else{
		matrix.reverse();
	} 
}	
	   
//to drop in piece and update for a new piece
let lastTime = 0 ;
function update(time = 0){ 
	var deltaTime = time-lastTime; //to calculate actual time
	lastTime = time;
	
	dropCounter += deltaTime;
	if(dropCounter > dropInterval){
		playerDrop(); //dropping the piece
	}
	draw(); //calling drawing function
	requestAnimationFrame(update);//to animate the dropping piece
}
	
//adding event listener to rotate or move the pieces
document.addEventListener("keydown", function(event) {
	if(event.keyCode == 37){ //left arrow(moving the piece towards left)
		playerMove(-1);
	}else if(event.keyCode == 39){   //right arrow(moving the piece towards right)
		playerMove(1);
	}else if(event.keyCode == 40){    //down arrow(moving the piece downwards)
		playerDrop();
	}else if(event.keyCode == 32){   //for spacebar -flipping the piece counter clockwise
		playerRotate(-1);
	}
});
	
//updating score to display
function updateScore(){
	document.getElementById("score").innerHTML = player.score;
}

//drawing another piece when one piece touches the ground
playerReset();

//updating the score
updateScore();

//updating the display
update();

//to pause the game
document.addEventListener("keydown", function(event) {
	if(event.keyCode == 80){ //press p 
		alert("Game Paused");
	}
});