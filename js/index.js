var stage = new createjs.StageGL("canvas", {antialias:true,preserveBuffer:true});

var MAX=1200,
    RADIUS = 20,
    COLORS = [
      {title: "Pie", colors:["#fffcfc", "#f0dfab", "#c98a3b", "#f10879", "#e0a421"]},
      {title: "Samurai", colors:["#080808","#4E280B","#CFCF7C","#5C1E1B","#CA0700"]},
      {title: "Firefox", colors:["#4878A8","#A8D8F0","#F07830","#781800","#487890"]},
      {title: "Froggy", colors:["#2C1E1E","#32382C","#235D23","#C6D5B0","#DFFF6D"]},
      {title: "Let's Go Oil", colors:["#E1D4C0", "#FF6600", "#104386","#6699FF","#F5EDE3"]},   
      {title: "Cherry\nBlossom", colors:["#BD1311","#B8B8B8","#FFFFFF","#DB4342","#D33534"]},
      {title: "Smog", colors:["#607890","#8E9E82","#CACCB6","#F2F0DF","#A9C1D9"]}
    ];

var colors, title, bgColor;
var textTimeout;
var sb, ss,
    store = [],
    sprites = [];

// Preload the font, since it sometimes isn't ready in time.
var loader = new createjs.FontLoader({
			src: "https://fonts.googleapis.com/css?family=Magra:700",
			type: "fontcss"
}, true);
loader.on("complete", showText);
loader.load();
var textReady = false;

function init() {
  stage.autoClear = true;
  
  var index = Math.random() * COLORS.length | 0;
  colors = COLORS[index].colors;
  title = COLORS[index].title.toUpperCase();
  bgColor = colors[Math.random()*colors.length|0];
  stage.setClearColor(bgColor);
  fill.fillCmd.style = bgColor;
  fill.updateCache();
  
  // Make Sprites, and create a SpriteSheet for GL
  sb = new createjs.SpriteSheetBuilder();
  for (var i=0, l=colors.length; i<l; i++) {
    var sprite = new createjs.Shape();
    sprite.graphics
      .f(colors[i])
      .dc(0,0,RADIUS);
    sb.addFrame(sprite, new createjs.Rectangle(-RADIUS,-RADIUS,RADIUS*2,RADIUS*2),2);
  }
  ss = sb.build();
  
  sprites.length = store.length = 0;
  cont.removeAllChildren();
  
  
  // Add text, fade in after 3s
  textReady = false;
  clearTimeout(textTimeout);
  textTimeout = setTimeout(function() {
    textReady = true;
    showText();
  }, 3000);
  
  // Seed the effect so it looks right at the start.
  for (var i=0; i<80; i++) {
    tick();
  }
}

function showText() {
  if (!loader.loaded || !textReady) { return; }
  var text = new createjs.Text(title, "20px Magra", bgColor)
      .set({textAlign:"center",y:-10});
  var b = text.getBounds();
  text.cache(b.x, b.y, b.width, b.height*1.5, 2);
  cont.addChildAt(text, 0);
}

// Object Pool
function getSprite() {
  var sprite = null;
  if (store.length == 0) {
    if (sprites.length >= MAX) { return; }
    sprite = new createjs.Sprite(ss);
  } else {
    sprite = store.pop();
  }
  sprite.gotoAndStop(Math.random()*colors.length|0);
  return sprite;
}
function returnSprite(sprite) {
  store.unshift(sprite);
}

// Create a new sprite from the pool and initialize
function createSprite() {
  var sprite = getSprite();
  if (sprite != null) {
    cont.addChildAt(sprite, 0);
    sprite.set({
      a: Math.random() * Math.PI*2,
      speed: Math.random() * 1,
      g: 0.1,
      scale: 0.5,
      alpha: 0
    });
    var pos = Math.random() * 50;
    sprite.x = Math.sin(sprite.a) * pos;
    sprite.y = Math.cos(sprite.a) * pos;
    sprites.push(sprite);
  }
}

// Init
var cont = new createjs.Container()
  .set({x:400,y:400, scale:2}); // TODO: Center on size
var fill = new createjs.Shape().set({alpha:0.05});
fill.fillCmd = fill.graphics.f("#000").command;
fill.graphics.dr(0,0,100,100);
fill.cache(0,0,100,100);
stage.addChild(fill, cont);

createjs.Ticker.timingMode = "raf";
createjs.Ticker.on("tick", tick);

// On Tick, make a new sprite, and move the rest.
var h = 1;
function tick(event) {
  
  createSprite();
  createSprite();
  createSprite();
  
  for (var i=sprites.length-1; i>=0; i--) {
    var sprite = sprites[i];
    sprite.x += Math.sin(sprite.a)*sprite.speed;
    sprite.y += Math.cos(sprite.a)*sprite.speed;
    sprite.scale *= 0.97;
    sprite.g *= 1.02;
    sprite.y += sprite.g;
    sprite.speed *= 0.997;
    sprite.alpha = Math.min(1, sprite.alpha + 0.1);
    
    if (sprite.scale < 0.01) {
      sprites.splice(i, 1);
      cont.removeChild(sprite);
      returnSprite(sprite);
    }
  }
  
  
  stage.update(event);
}

// Simple Resize
window.addEventListener("resize", handleResize);
function handleResize() {
  var w = stage.canvas.width = window.innerWidth;
  var h = stage.canvas.height = window.innerHeight;
  cont.x = w >> 1;
  cont.y = h >> 1;
  fill.scaleX = w/100;
  fill.scaleY = h/100;
  stage.updateViewport(w,h);
}
handleResize();

stage.on("stagemousedown", function() {
    stage.autoClear = false;
})

// Click to draw
stage.on("stagemouseup", init);
document.getElementById("overlay").addEventListener("click", init)
init();