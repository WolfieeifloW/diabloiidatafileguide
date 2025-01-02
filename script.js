function changeMode(elem) {
  var element = document.body;
  element.classList.toggle("light-mode");
  
  // if (elem.textContent =="☼") {
  //   elem.textContent = "☽";
  // } else {
  //   elem.textContent = "☼";
  // }
  var elem = document.getElementById("modeButton");

  if (elem.innerHTML == "☼") {
    elem.innerHTML = "☽"
  } else {
    elem.innerHTML = "☼"
  }
}

var toc = document.querySelector('.toc');
var tocPath = document.querySelector('.toc-marker path');
var tocItems;
var TOP_MARGIN = 0.1,
    BOTTOM_MARGIN = 0.2;
var pathLength;
var lastPathStart,
		lastPathEnd;

window.addEventListener('resize', drawPath, false);
window.addEventListener('scroll', sync, false);

drawPath();

function drawPath() {
  tocItems = [].slice.call(toc.querySelectorAll('li'));

  // Cache element references and measurements
  tocItems = tocItems.map(function(item) {
    var anchor = item.querySelector('a');
    var target = document.getElementById(anchor.getAttribute('href').slice(1));

    return {
      listItem: item,
      anchor: anchor,
      target: target
    };
  });

  // Remove missing targets
  tocItems = tocItems.filter(function(item) {
    return !!item.target;
  });

  var path = [];
  var pathIndent;

  tocItems.forEach(function(item, i) {
    var x = item.anchor.offsetLeft - 5,
        y = item.anchor.offsetTop,
        height = item.anchor.offsetHeight;

    if (i === 0) {
      path.push('M', x, y, 'L', x, y + height);
      item.pathStart = 0;
    } else {
      // Draw an additional line when there's a change in
      // indent levels
      if (pathIndent !== x) path.push('L', pathIndent, y);
      path.push('L', x, y);
      // Set the current path so that we can measure it
      tocPath.setAttribute('d', path.join(' '));
      item.pathStart = tocPath.getTotalLength() || 0;
      path.push('L', x, y + height);
    }
    pathIndent = x;
    // tocPath.setAttribute('d', path.join(' '));
    item.pathEnd = tocPath.getTotalLength();
  });
  
  pathLength = tocPath.getTotalLength();
  sync();
}

function sync() {
  var windowHeight = window.innerHeight;
  var pathStart = pathLength,
      pathEnd = 0;
  var visibleItems = 0;
  
  tocItems.forEach(function(item) {
    var targetBounds = item.target.getBoundingClientRect();
    
    if (targetBounds.bottom > windowHeight * TOP_MARGIN && targetBounds.top < windowHeight * (1 - BOTTOM_MARGIN)) {
      pathStart = Math.min(item.pathStart, pathStart);
      pathEnd = Math.max(item.pathEnd, pathEnd);
      visibleItems += 1;
      item.listItem.classList.add('visible');
    } else {
      item.listItem.classList.remove('visible');
    }
  });

  if (visibleItems > 0 && pathStart < pathEnd) {
    if (pathStart !== lastPathStart || pathEnd !== lastPathEnd) {
      tocPath.setAttribute('stroke-dashoffset', '1');
      tocPath.setAttribute('stroke-dasharray', '1, ' + pathStart + ', ' + (pathEnd - pathStart) + ', ' + pathLength);
      tocPath.setAttribute('opacity', 1);
    }
  } else {
    // tocPath.setAttribute('opacity', 0);
  }
  
  lastPathStart = pathStart;
  lastPathEnd = pathEnd;
}