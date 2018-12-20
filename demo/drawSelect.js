let $CAMIC = null;
const $UI = {};
const $D = {
  pages: {
    home: './table.html',
    table: './table.html'
  },
  params: null // parameter from url - slide Id and status in it (object).
};

/**
 * drawRectangle
 * @param e
 */
function drawRectangle(e) {
  console.log('drawRectangle');

  let canvas = $CAMIC.viewer.drawer.canvas; //finds Original Canvas

  canvas.style.cursor = e.checked ? 'crosshair' : 'default';

  if (e.checked)
  {
    // TESTING
    let canv = document.createElement('canvas'); // creates new canvas element
    canv.id = 'canvasdummy'; // gives canvas id
    canv.height = canvas.height; //get original canvas height
    canv.width = canvas.width; // get original canvas width
    canv.style.left = "0px";
    canv.style.top = "0px";
    canv.style.position = "absolute";
    document.body.appendChild(canv); // adds the canvas to the body element

    let canvas1 = document.getElementById('canvasdummy'); //find new canvas we created
    let context = canvas1.getContext('2d');

    initDraw(canvas1, context);
    //initDrawTemp(e);
  }
  else
  {
    //stopDraw(canvas);
  }

}

/**
 * copy canvas selection as image
 * @param bound
 * @param event
 * @param canvasDraw
 */
function copy(bound, event, canvasDraw) {

  var canvas = $CAMIC.viewer.drawer.canvas;
  var ctx = $CAMIC.viewer.drawer.context;

  const xCoord = bound[0][0];
  const yCoord = bound[0][1];
  const canvasWidth = event.eventSource._display_.width;
  const canvasHeight = event.eventSource._display_.height;

  var imgData = ctx.getImageData(xCoord, yCoord, canvasWidth, canvasHeight);

  let data = imgData.data;
  console.log('array', Array.isArray(data));
  console.log('type', typeof data);
  console.log('imgData', data);

}

/**
 * stop draw temp
 * @param e
 */
var TD;
function stopDrawTemp(event)
{
  TD = event;

  const viewer = $CAMIC.viewer;
  const canvasDraw = viewer.canvasDrawInstance;

  let imgColl = canvasDraw.getImageFeatureCollection();

  let bound;
  if (imgColl.features.length > 0) {
    bound = imgColl.features[0].bound;
  }

  copy(bound, event, canvasDraw);
  // var canvas = event.eventSource._draw_; // document.getElementById("mycanvas");
  // var img    = canvas.toDataURL("image/png");
  // console.log(img);
}

/**
 * init draw temp
 * @param e
 */
function initDrawTemp(e) {
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawMode = 'rect';
  console.log(canvasDraw);

  if (e.checked) {
    canvasDraw.drawOn();
  } else {
    canvasDraw.drawOff();
  }
  $CAMIC.viewer.canvasDrawInstance.addHandler('stop-drawing', stopDrawTemp);
}

/**
 * stop draw
 * @param canvas
 */
function stopDraw(canvas)
{
  // idk yet.
}

/**
 * init draw
 * @param canvas
 */
function initDraw(canvas) {
  var mouse = {
    x: 0,
    y: 0,
    startX: 0,
    startY: 0
  };

  function setMousePosition(e) {
    var ev = e || window.event; //Moz || IE
    if (ev.pageX) { //Moz
      mouse.x = ev.pageX + window.pageXOffset;
      mouse.y = ev.pageY + window.pageYOffset;
    } else if (ev.clientX) { //IE
      mouse.x = ev.clientX + document.body.scrollLeft;
      mouse.y = ev.clientY + document.body.scrollTop;
    }
  }
  var element = null;
  canvas.onmousemove = function (e) {
    setMousePosition(e);
    if (element !== null) {
      element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
      element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
      element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
      element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
    }
  };

  canvas.onclick = function (e) {
    if (element !== null) {
      element = null;
      canvas.style.cursor = "default";
      console.log("finished.");
    } else {
      console.log("begun.");
      mouse.startX = mouse.x;
      mouse.startY = mouse.y;
      element = document.createElement('div');
      element.className = 'rectangle';
      element.style.left = mouse.x + 'px';
      element.style.top = mouse.y + 'px';
      canvas.appendChild(element);
      canvas.style.cursor = "crosshair";
    }
  }
}

function initialize() {
  initUIcomponents();
  initCore();
}

function initUIcomponents() {
  $UI.toolbar = new CaToolbar({
    id: 'ca_tools',
    zIndex: 601,
    hasMainTools: false,
    subTools: [
      // rectangle draw
      {
        icon: 'timeline',
        type: 'check',
        value: 'rect',
        title: 'Rectangle',
        callback: drawRectangle
      }
    ]
  });
}

// setting core functionality
function initCore() {
  // start initial
  const opt = {
    hasZoomControl: true,
    hasDrawLayer: true,
    hasLayerManager: true,
    hasScalebar: true,
    hasMeasurementTool: true
  };
  // set states if exist
  if ($D.params.states) {
    opt.states = $D.params.states;
  }
  try {
    $CAMIC = new CaMic("main_viewer", $D.params.slideId, opt);
  } catch (error) {
    Loading.close();
    $UI.message.addError('Core Initialization Failed');
    console.error(error);
    return;
  }
  $CAMIC.loadImg(function (e) {
    // image loaded
    if (e.hasError) {
      $UI.message.addError(e.message)
    }
  });
}

function redirect(url ,text = '', sec = 5){
  let timer = sec;
  setInterval(function(){
    if(!timer) {
      window.location.href = url;
    }

    if(Loading.instance.parentNode){
      Loading.text.textContent = `${text} ${timer}s.`;
    }else{
      Loading.open(document.body,`${text} ${timer}s.`);
    }
    // Hint Message for clients that page is going to redirect to Flex table in 5s
    timer--;

  }, 1000);
}
