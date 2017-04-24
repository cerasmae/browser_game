var canvas = document.getElementById('c');
var context = canvas.getContext('2d');
var bckgrColor = '#fff';
var defaultColor = true;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.font = "20px Tahoma";

var colors = [];
var selectedColors = [];

var balls = [];
var characterColor;
var characterRadius;
var score;
var scoreInc = 1000;

var mouseMoved = false;
var sameScore = false;
var negative;
var sc = score;

var menuBalls = [];
var menuColors = [];
var beginGame = 0;

var totalBalls = 20;
var totalColors = totalBalls / 5;

var mouseX = canvas.width/2;
var mouseY = canvas.height/2;
var clickX;
var clickY;

var playAgain = new rotatingBalls(0);
var hasLost = false;

var sameCounter = 0;
var otherCounter = 0;
var sameCounterInc = 25;

var showHow = false;
var fontColor = '#000';

var wingsAudio = new Howl({
    src: ['assets/audio/wings.wav'],
    autoplay: true,
    loop: true
}).play();

///////////////////////////////////////////////////////////////////////

function clearCanvas() {
  context.fillStyle = bckgrColor;
  context.fillRect(0,0,canvas.width,canvas.height);
}

function randomBetween(min,max) {
  return Math.floor((Math.random()*(max - min)+min));
}

function getHypothenuse(x1, y1, x2, y2) {
  var diffx = Math.abs(x1 - x2);
  var diffy = Math.abs(y1 - y2);
  return Math.sqrt(diffx*diffx+diffy*diffy);
}

function colorChooser(){
    var currColor;
    var isIn = false;
    if(selectedColors.length < 1){
        currColor = colors[randomBetween(0, colors.length)];
        selectedColors.push(currColor);
        return currColor;
    } else if( selectedColors.length == balls.length/5 ){
        return colors[randomBetween(0, colors.length)];
    } else{
        //assures that all colors will be included
        for(var i = 0; i < colors.length; i++){

            if( selectedColors.indexOf(colors[i]) == -1 ){
                currColor = colors[i];
                selectedColors.push(currColor);
                console.log('color: ', currColor, selectedColors.length);
                return currColor;
            }
        }

        return colors[randomBetween(0, colors.length)];
    }
}


///////////////////////////////////////////////////////////////////

function initializeGame(){
    balls = [];
    colors = [];
    selectedColors = [];

    for( var i = 0; i < totalColors; i++){
        colors[i] = randomColor();
    }

    console.log('allColors: ', colors, colors.length);

    characterColor = colors[randomBetween(0, colors.length)];
    characterRadius = 10;
    score = 0;

    for( var i = 0; i < totalBalls; i++ ){
        balls.push(new Ball());
    }

}

function leveling(totBalls, totColors){

    for( var i = 0; i < totColors; i++){
        colors[i] = randomColor();
    }

    for( var i = 0; i < totBalls; i++ ){
        balls.push(new Ball());
    }

}

function initializeMenu(){
    menuBalls[0] = new playBall();
    menuBalls[1] = new rotatingBalls(80)//(randomBetween(0, 180));
    menuBalls[2] = new rotatingBalls(146)//(randomBetween(0, 180));

    characterColor = colors[randomBetween(0, colors.length)];
    characterRadius = 10;
    score = 0;
}

function Ball() {
    this.radius = randomBetween(10, 50);
    this.x = randomBetween(0+this.radius, canvas.width-this.radius);
    this.y = randomBetween(0+this.radius, canvas.height-this.radius);
    this.inRangeX = false;
    this.inRangeY = false;
    this.repel = false;

    this.color = colorChooser();

    this.dirx = randomBetween(-5,6);
    this.diry = randomBetween(-5,6);

    if( this.dirx == 0 ){
        this.dirx = 1;
    }

    if( this.diry == 0 ){
        this.diry = 1;
    }

    this.update = function() {
        this.x += this.dirx;
        this.y += this.diry;

        if (  this.x - this.radius <= 0 ||
            this.x + this.radius >= canvas.width) {
            this.dirx *= -1;
        }
        if (  this.y - this.radius <= 0 ||
            this.y + this.radius >= canvas.height) {
            this.diry *= -1;
        }

        return this;
        }

    this.draw = function() {

        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, Math.PI*2, false);
        context.fill();

    }
}

function playBall(){
    this.radius = 100;
    this.x = canvas.width/2;
    this.y = canvas.height/2;

    this.color = randomColor();

    this.update = function(){
        return this;
    }

    this.draw = function(name) {

        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, Math.PI*2, false);
        context.fill();

        context.fillStyle = '#000';
        context.fillText(name, this.x-15, this.y+5);

    }
}

function rotatingBalls(point){
    this.radius = 50;
    this.path = 200;
    this.origx = canvas.width/2;
    this.origy = canvas.height/2;
    this.x = canvas.width/2;
    this.y = canvas.height/2;
    this.point = point;

    this.color = randomColor();

    this.update = function(){
        this.point += 0.03;

        this.x = Math.floor(this.origx + (this.path * Math.cos(this.point)));
        this.y = Math.floor(this.origy + (this.path * Math.sin(this.point)));

        return this;
    }

    this.draw = function(name) {

        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, Math.PI*2, false);
        context.fill();

        context.fillStyle = '#000';
        context.fillText(name, this.x - name.length*4, this.y + name.length*1.7);

    }
}

function drawCharacter() {
      context.fillStyle = characterColor;//'#000';
      context.beginPath();
      context.arc(mouseX, mouseY, characterRadius, Math.PI*2, false);
      context.fill();
}


//////////////////////////////////////////////////////////////////////////

function world() {

    var nameBall;
    console.log('showhow', showHow);
    clearCanvas();

    switch(beginGame){
        case 0: //menu
            if(showHow){
                context.fillStyle = fontColor;
                context.fillText('Collide with balls of your same color.', 50, 100);
                context.fillText('Be careful though! You don\'t want to.', 50, 125);
                context.fillText('mess with the other colors. :>', 50, 150);
            }

            for( var i = 0; i < menuBalls.length; i++){
                if( i == 0 ){
                    nameBall = 'Play';
                } else if( i == 1 ){
                    nameBall = 'How';
                } else{
                    nameBall = 'Lights';
                }
                menuBalls[i].update().draw(nameBall);
            }

            drawCharacter();

        break;

    case 1: //game

        for (var i = 0; i < balls.length; i++) {
            if(getHypothenuse(mouseX, mouseY, balls[i].x, balls[i].y ) <=
                characterRadius + balls[i].radius && mouseMoved ){
                console.log(characterColor, balls[i].color);
                if( balls[i].color == characterColor ){
                    score+=balls[i].radius;
                    selectedColors.splice( selectedColors.indexOf(balls[i].color), 1 );
                    balls[i] = new Ball();
                    characterColor = selectedColors[randomBetween(0, selectedColors.length)];
                    sameScore = false;
                    sameCounter++;
                } else{
                    balls[i].repel = true;
                    score -= 2;
                    sameScore = false;
                    characterRadius *= 1.01;
                    otherCounter--;
                }
            } else{
                balls[i].repel = false;
            }
            if( balls[i].repel ){
                balls[i].dirx *= -1;
                balls[i].diry *= -1;
                balls[i].repel = false;
            }
            balls[i].update().draw();
        }


        if( sameCounter % 10 == 0 && characterRadius > 20 && sameCounter != 0){
            characterRadius -= 5;
            sameCounter++;
        } else if( otherCounter % 25 == 0 && !sameScore && otherCounter != 0 ){
            sameScore = true;
            characterRadius += 1;
        }

        if(sameCounter % sameCounterInc == 0 && sameCounter != 0 || score > scoreInc ){
            scoreInc += 1000;
            sameCounterInc += 25;
            // var tot = balls.length + 10;
            leveling(10, 2);
        }


        if( characterRadius > 1000 ){
            beginGame = 2;
            hasLost = true;
        // characterRadius = 10;
        }

        drawCharacter();
        break;
    case 2: //lose
        if(showHow){
            context.fillStyle = fontColor;
            context.fillText('Collide with balls of the same color.', 50, 100);
            context.fillText('Be careful though! You don\'t want to', 50, 125);
            context.fillText('mess with the other colors. :>', 50, 150);
        }
        characterRadius = 20;
        for( var i = 0; i < menuBalls.length; i++){
            if( i == 0 ){
                nameBall = 'Again?                                                    ';
            } else if( i == 1 ){
                nameBall = 'How ';
            } else{
                nameBall = 'Lights';
            }
            menuBalls[i].update().draw(nameBall);
            }

        drawCharacter();

    break;

    }

    var scoreText = 'Score: ';
    context.fillStyle = fontColor;
    context.fillText( scoreText+score, 50, 50);

}

//////////ALL EVENT LISTENERS/////////////////////////////////////////////////

window.addEventListener('mousemove', function(e) {
  mouseX = e.pageX;
  mouseY = e.pageY;

  mouseMoved = true;
});

window.addEventListener('click', function(e){
  clickX = e.pageX;
  clickY = e.pageY;

        for(var i = 0; i < menuBalls.length; i++ ){
        if( getHypothenuse(clickX, clickY, menuBalls[i].x, menuBalls[i].y) < menuBalls[i].radius){
          switch( i ){
            case 0:
              beginGame = 1;
              initializeGame();
              showHow = false;
              break;
            case 1:
                showHow = true;
              break;
            case 2:
              if( defaultColor ){
                defaultColor = false;
                bckgrColor = "#2c2e30";
                fontColor = '#fff';
              } else{
                defaultColor = true;
                bckgrColor = "#fff";
                fontColor = '#000';
              }
              break;
          }
        }
    }

});

/////////////////////////////////////////////////////////////////////////////////////////
initializeMenu();
// initializeGame();
setInterval(world,30);