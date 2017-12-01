'use strict';

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} [options]
 * @param {number} [options.pixelSize] defaults to 1px
 * @param {number} [options.color] defaults to black
 * @class
 */
var Pencil = function(canvasEl, options) {
	options = options || {};

	this._id = options.id;
	this._currentPixel = undefined;
	this._pixelSize = options.pixelSize || 1;
	this._color = options.color || 'black';
	this._canvasEl = canvasEl;
	this._socket = options.socket || 1;
	this._context = canvasEl.getContext('2d');
	this._pixels = {};
	this._collection = [];

	bindHandlers(this);
};


function bindHandlers(context) {
	for (var i in context) {
		if (typeof context[i] === 'function' && i.indexOf('_on') === 0) {
			context[i] = context[i].bind(context);
		}
  	}
}


/*
 * @param {Event} e
 * @returns {object}
 */
Pencil.prototype._getCoordFromEvent = function(e) {
  	var rect = this._canvasEl.getBoundingClientRect();
  	e = e.touches ? e.touches[0] : e;
  	return {
		x: e.clientX - rect.left,
		y: e.clientY - rect.top
  	};
};


/*
 * @param {Event} e
 * @returns {object}
 */
Pencil.prototype._getPixelFromEvent = function(e) {
	var coord = this._getCoordFromEvent(e);
  	return {
		x: Math.floor(coord.x / this._pixelSize),
		y: Math.floor(coord.y / this._pixelSize)
  	};
};

Pencil.prototype._onDown = function(e) {
	if (this._active) return;

	if (e.touches) {
		document.addEventListener('touchmove', this._onMove);
		document.addEventListener('touchend', this._onTouchEnd);
  	} else {
		document.addEventListener('mousemove', this._onMove);
		document.addEventListener('mouseup', this._onMouseUp);
		document.addEventListener('keydown', this._onKeyDown);
  	}	

  	this._active = false;

 	this._currentPixel = this._getPixelFromEvent(e);
  	this._socket.emit('draw', { x:  this._currentPixel.x, y: this._currentPixel.y, color: this._color});
};

Pencil.prototype._onKeyDown = function(e) {
	if (e.keyCode === 27) { // ESC
		this._active = false;
		this.clear();
  	}
};


Pencil.prototype._onMove = function(e) {
	if (!this._active) this._active = true;
	
	var pixel = this._getPixelFromEvent(e);
	var prevPixel = this._currentPixel;

	this._collection.push(pixel);
	this._currentPixel = pixel;
	
	this._socket.emit('draw', { x:  this._currentPixel.x, y: this._currentPixel.y, color: this._color});
};


Pencil.prototype._onMouseUp = function() {
	this._onUp();
	document.removeEventListener('mousemove', this._onMove);
	document.removeEventListener('mouseup', this._onMouseUp);
	document.removeEventListener('keydown', this._onKeyDown);
};


Pencil.prototype._onUp = function() {
	if (!this._active) return;

	this._active = false;
	this._collection = []; // Clear the collection
};


/*
 * Writes and renders a given pixel based on the current color
 * @param {object} pxCoord
 */
Pencil.prototype.drawPixel = function(pxCoord) {
	// Will not draw if pixel is out of range of canvas
	if (pxCoord.x * this._pixelSize >= this._canvasEl.width || pxCoord.y * this._pixelSize >= this._canvasEl.height) {
		return;
	}
	
	if (!this._pixels[pxCoord.x]) this._pixels[pxCoord.x] = {};
	this._pixels[pxCoord.x][pxCoord.y] = pxCoord.color; // color pixel

	var color = pxCoord.color;

	this._context.fillStyle = pxCoord.color;
	this._context.fillRect(
	this._pixelSize * pxCoord.x,
	this._pixelSize * pxCoord.y,
	this._pixelSize, this._pixelSize);
};


/**
 * Enable drawing interaction
 */
Pencil.prototype.enable = function() {
	this._canvasEl.addEventListener('mousedown', this._onDown);
	this._canvasEl.addEventListener('touchstart', this._onDown);
	
	return this;
};

Pencil.prototype._clearCanvas = function() {
  var canvas = this._canvasEl;
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
};


if (typeof module !== 'undefined' && module.exports) {
	module.exports = Pencil;
} else {
	window.Pencil = Pencil;
}