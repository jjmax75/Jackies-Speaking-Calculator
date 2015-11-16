var calcCanvas = document.getElementById("calculator"),
    canvasLeft = calcCanvas.offsetLeft,
    canvasTop = calcCanvas.offsetTop,
    ctx = calcCanvas.getContext('2d'),
    buttons = [
      {x: 60, y: 220, char: '7', op: false},
      {x: 120, y: 220, char: '8', op: false},
      {x: 180, y: 220, char: '9', op: false},
      {x: 240, y: 220, char: '\u00F7', op: true}, // division
      {x: 60, y: 280, char: '4', op: false},
      {x: 120, y: 280, char: '5', op: false},
      {x: 180, y: 280, char: '6', op: false},
      {x: 240, y: 280, char: '\u00D7', op: true}, // multiplication
      {x: 60, y: 340, char: '1', op: false},
      {x: 120, y: 340, char: '2', op: false},
      {x: 180, y: 340, char: '3', op: false},
      {x: 240, y: 340, char: '\u2212', op: true}, // minus
      {x: 60, y: 400, char: '0', op: false},
      {x: 120, y: 400, char: '\u002E', op: false}, // decimal point
      {x: 180, y: 400, char: '\u003D', op: true}, // equals
      {x: 240, y: 400, char: '\u002B', op: true} // addition
    ],
    runningTotal = 0,
    displayArr = [],
    operators = {
      '\u002B': function(a, b) {return a + b;},
      '\u2212': function(a, b) {return a - b;},
      '\u00D7': function(a, b) {return a * b;},
      '\u00F7': function(a, b) {return a / b;},
      '\u003D': function(a, b) {return b;}
    },
    lastOperator = '\u003D',
    afterEquals = false; // switch to keep track of operators after an equals



// START - Drawing Functions
// canvas styles
ctx.lineWidth = 2;
var buttonRadius = 25;

//attempt at a gradent to resemble shiny plastic of kids toy
var plasticGradient = ctx.createRadialGradient(0, 0, 350, 50, 50, 600);
plasticGradient.addColorStop(0, '#ffeeee');
plasticGradient.addColorStop(0.9, '#ddefbb');
plasticGradient.addColorStop(1, '#ddd');

// draw a rounded rectangle
function roundedRect(xCor, yCor, cornerRadius, length, height) {
  // take into account radius of corner in sides
  var rectLength = length - cornerRadius * 2;
  var rectHeight = height - cornerRadius * 2;
  ctx.save();
  ctx.beginPath();
  //go around counter clockwise from top left
  ctx.translate(xCor, yCor + cornerRadius);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, rectHeight);
  ctx.translate(0, rectHeight);
  ctx.quadraticCurveTo(0, cornerRadius, cornerRadius, cornerRadius);
  ctx.translate(cornerRadius, cornerRadius);
  ctx.lineTo(rectLength, 0);
  ctx.translate(rectLength, 0);
  ctx.quadraticCurveTo(cornerRadius, 0, cornerRadius, -cornerRadius);
  ctx.translate(cornerRadius, -cornerRadius);
  ctx.lineTo(0, -rectHeight);
  ctx.translate(0, -rectHeight);
  ctx.quadraticCurveTo(0, -cornerRadius, -cornerRadius, -cornerRadius);
  ctx.translate(-cornerRadius, -cornerRadius);
  ctx.lineTo(-rectLength, 0);
  ctx.translate(-rectLength, 0);
  ctx.quadraticCurveTo(-cornerRadius, 0, -cornerRadius, cornerRadius);
  ctx.stroke();
  ctx.restore();
}

// draw the calculator buttons
function drawButtons() {
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  buttons.forEach(function(button) {
    ctx.beginPath();
    if (button.op) {
      ctx.fillStyle = '#77D13F';
    } else {
      ctx.fillStyle = '#E1163C';
    }

    ctx.arc(button.x, button.y, buttonRadius, 0, 2*Math.PI);
    ctx.stroke();
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.fillText(button.char, button.x, button.y);
  });

}

function drawScreen() {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'black';
  ctx.font = '48px Share Tech Mono';
  var numberX = 250, numberY = 140;
  for (var i = displayArr.length - 1; i >= 0; i--) {
    ctx.fillText(displayArr[i], numberX, numberY);
    numberX -= 20;
  }
}

// Draw the calculator
// Called at the start and each time display is changed
function drawCalc() {
  // calculator body
  ctx.beginPath();
  ctx.fillStyle = plasticGradient;
  ctx.moveTo(0, 100);
  ctx.lineTo(10, 450);
  ctx.quadraticCurveTo(150, 500, 290, 450);
  ctx.lineTo(300, 100);
  ctx.quadraticCurveTo(150, 10, 0, 100);
  ctx.fill();
  ctx.stroke();

  // calculator screen frame
  ctx.fillStyle = "#ffe330";
  roundedRect(25, 100, 10, 250, 75);
  ctx.fill();
  ctx.fillStyle = "#4FCCF9";
  roundedRect(35, 110, 5, 230, 55);
  ctx.fill();

  // buttons
  drawButtons();

  // clear button
  ctx.fillStyle = "#ffe330";
  roundedRect(100, 435, 5, 100, 35);
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.fillText('CLEAR', 150, 455);

  // display digits
  drawScreen();
}
// END Drawing functions


// START - Logic
// which button was pressed
function whichButton(x, y, cx, cy) {
  var dx = x - cx;
  var dy = y - cy;
  return dx * dx + dy * dy <= buttonRadius * buttonRadius;
}

function speak(utter) {
  var sayWhat = utter === '\u002E' ?
    new SpeechSynthesisUtterance('point') : // jshint ignore:line
    new SpeechSynthesisUtterance(utter); // jshint ignore:line

  sayWhat.lang = "en-GB";
  window.speechSynthesis.speak(sayWhat);
}

// calculator logic
function calculate(operator) {
  var displayNum = parseFloat(displayArr.join(''));
  runningTotal = operators[lastOperator](runningTotal, displayNum);
  runningTotal = runningTotal.toPrecision(10).replace(/\.?0+$/,"");
  if (runningTotal > 9999999999) {
    runningTotal = "BIG NUMBER!";
  }
  if (operator === '=') {
    displayArr = runningTotal.toString().split('');
    drawCalc();
  } else {
    displayArr = [];
  }
  lastOperator = operator;
}
//END - Logic



// START - events
calcCanvas.addEventListener('click', function(event) {
  var clickX = event.pageX - canvasLeft,
      clickY = event.pageY - canvasTop;

  buttons.forEach(function(button) {
    if (whichButton(clickX, clickY, button.x, button.y)) { //was a button clicked?
      if (!button.op) { // if a number is clicked
        if (displayArr.length >= 11) {
          if ('speechSynthesis' in window) {
            speak("Sorry, too many numbers");
          }
        } else {
          if (afterEquals === true) {
            displayArr = [];
            drawCalc();
            afterEquals = false;
          }
          displayArr.push(button.char);
          if ('speechSynthesis' in window) {
            speak(button.char);
          }
          drawCalc();
        }
      } else {
        afterEquals = false;
        calculate(button.char);
        if ('speechSynthesis' in window) {
          speak(button.char);
        }
        if (button.char === '=') {
          if ('speechSynthesis' in window) {
            speak(runningTotal);
          }
          afterEquals = true;
        }
      }
    }
  });
  // clear button
  if ((clickX > 100 && clickX < 200) &&
  (clickY > 435 && clickY < 470)) {
    displayArr = [];
    runningTotal = 0;
    lastOperator = '\u003D';
    afterEquals = false;
    drawCalc();
  }
});

// if speech synthesis api is available change title of page
if ('speechSynthesis' in window){
  document.getElementsByClassName('can-speak')[0].textContent = 'Speaking';
}



// INIT
if (ctx) {
  drawCalc();
}
