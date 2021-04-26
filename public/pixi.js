// Declare all vars
let bgSprite,
    displacementSprite,
    displacementFilter,
    pointerSprite,
    pointerFilter;

// Images used
const images = [
  { 
    name: 'bg', 
    url: 'gr_bg.png'
  },
  { 
    name: 'clouds', 
    url: 'https://images.unsplash.com/photo-1592330804928-231e83180766?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1050&q=80'
  }
];

const logicalWidth = 1920;
const logicalHeight = 1080;

// Determine & create the PIXI App instance
const canvasEl = document.querySelector('.js-canvas');
const canvasElOptions = {
  autoDensity: true,
  backgroundColor: 0xFFFFFF,
  resizeTo: window,
  resolution: window.devicePixelRatio || 1,
  view: canvasEl
};

const resizeHandler = () => {
  const scaleFactor = Math.min(
    window.innerWidth / logicalWidth,
    window.innerHeight / logicalHeight
  );
  const newWidth = Math.ceil(logicalWidth * scaleFactor);
  const newHeight = Math.ceil(logicalHeight * scaleFactor);
  app.renderer.view.style.width = `${newWidth}px`;
  app.renderer.view.style.height = `${newHeight}px`;

  app.renderer.resize(newWidth, newHeight);
  mainContainer.scale.set(scaleFactor); 
};

let app = new PIXI.Application(canvasElOptions);
let mainContainer = new PIXI.Container();

app.loader
  .add(images)
  .on('progress', loadProgressHandler)
  .load(setup);

app.renderer.plugins.interaction.moveWhenInside = true;

function loadProgressHandler(loader, resource) {
  //Display the percentage of files currently loaded
  console.log("progress: " + loader.progress + "%");

  //If you gave your files names as the first argument 
  //of the `add` method, you can access them like this
  console.log("loading: " + resource.name);
}

function setup(loader, resources){
  console.log("All files loaded");
  resizeHandler();
  
  app.stage.addChild(mainContainer);
  
  window.addEventListener('resize', resizeHandler);
  
  bgSprite = new PIXI.Sprite(resources.bg.texture);
  bgSprite.interactive = true;
  displacementSprite = new PIXI.Sprite(resources.clouds.texture);
  // Make sure the sprite is wrapping.
  displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
  displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
  pointerSprite = new PIXI.Sprite(resources.clouds.texture);
  pointerFilter = new PIXI.filters.DisplacementFilter(pointerSprite);
  
  displacementSprite.width = bgSprite.height;
  displacementSprite.height = bgSprite.height;
  
  pointerSprite.anchor.set(0.5);
  pointerFilter.scale.x = 7;
  pointerFilter.scale.y = 7;
  
  mainContainer.addChild(bgSprite);
  mainContainer.addChild(displacementSprite);
  mainContainer.addChild(pointerSprite);
  mainContainer.filters = [displacementFilter, pointerFilter];
  
  pointerSprite.visible = false;
  
  bgSprite.on('mousemove', onPointerMove);
  
  function onPointerMove(eventData) {
    pointerSprite.visible = true;
    pointerSprite.position.set(eventData.data.global.x - 25, eventData.data.global.y - 25);
  }
  
  app.ticker.add((delta) => {
    // Offset the sprite position to make vFilterCoord update to larger value. 
    // Repeat wrapping makes sure there's still pixels on the coordinates.
    displacementSprite.x += 3.5 * delta;
    displacementSprite.y += 3.5 * delta;
    // Reset x & y to 0 when x > width to keep values from going to very huge numbers.
    if (displacementSprite.x > displacementSprite.width) { 
      displacementSprite.x = 0;
      displacementSprite.y = 0;
    }
  });
}