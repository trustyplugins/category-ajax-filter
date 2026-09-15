/*!
 * jQuery UI Touch Punch 0.2.3 (vendored for CAF range slider mobile drag)
 *
 * Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends: jquery.ui.widget.js, jquery.ui.mouse.js
 * Translates touch events into simulated mouse events for jQuery UI widgets.
 * No-op on non-touch devices (desktop behavior unchanged).
 */
(function ($) {
	'use strict';

	if ( ! $ || ! $.ui || ! $.ui.mouse ) {
		return;
	}

	// Skip on non-touch environments so mouse-only paths stay identical.
	$.support = $.support || {};
	$.support.touch =
		$.support.touch ||
		( 'ontouchend' in document ) ||
		( typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0 );

	if ( ! $.support.touch ) {
		return;
	}

	var mouseProto = $.ui.mouse.prototype;
	var _mouseInit = mouseProto._mouseInit;
	var _mouseDestroy = mouseProto._mouseDestroy;
	var touchHandled;

	function simulateMouseEvent( event, simulatedType ) {
		if ( event.originalEvent.touches.length > 1 ) {
			return;
		}

		event.preventDefault();

		var touch = event.originalEvent.changedTouches[0];
		var simulatedEvent = document.createEvent( 'MouseEvents' );

		simulatedEvent.initMouseEvent(
			simulatedType,
			true,
			true,
			window,
			1,
			touch.screenX,
			touch.screenY,
			touch.clientX,
			touch.clientY,
			false,
			false,
			false,
			false,
			0,
			null
		);

		event.target.dispatchEvent( simulatedEvent );
	}

	mouseProto._touchStart = function ( event ) {
		var self = this;

		if ( touchHandled || ! self._mouseCapture( event.originalEvent.changedTouches[0] ) ) {
			return;
		}

		touchHandled = true;
		self._touchMoved = false;
		simulateMouseEvent( event, 'mouseover' );
		simulateMouseEvent( event, 'mousemove' );
		simulateMouseEvent( event, 'mousedown' );
	};

	mouseProto._touchMove = function ( event ) {
		if ( ! touchHandled ) {
			return;
		}
		this._touchMoved = true;
		simulateMouseEvent( event, 'mousemove' );
	};

	mouseProto._touchEnd = function ( event ) {
		if ( ! touchHandled ) {
			return;
		}
		simulateMouseEvent( event, 'mouseup' );
		simulateMouseEvent( event, 'mouseout' );
		if ( ! this._touchMoved ) {
			simulateMouseEvent( event, 'click' );
		}
		touchHandled = false;
	};

	mouseProto._mouseInit = function () {
		var self = this;

		self.element.on( {
			'touchstart.ui-mouse-touch': $.proxy( self, '_touchStart' ),
			'touchmove.ui-mouse-touch': $.proxy( self, '_touchMove' ),
			'touchend.ui-mouse-touch': $.proxy( self, '_touchEnd' )
		} );

		_mouseInit.call( self );
	};

	mouseProto._mouseDestroy = function () {
		this.element.off( '.ui-mouse-touch' );
		_mouseDestroy.call( this );
	};
}( jQuery ) );
