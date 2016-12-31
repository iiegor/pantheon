'use strict';

/** @info Helpers */
const _actions = new Map();
const bind = (key, fn) => {
  if (!_actions.get(key)) {
    _actions.set(key, fn);
  } else {
    throw Error('JSAction already binded!');
  }
};

/** @info DOM Events */
bind('ripple.play', function(evt) {
  const maxSize = Math.max(this.clientWidth, this.clientHeight);

  const ripple = document.createElement('div');
  ripple.style.width = maxSize + 'px';
  ripple.style.height = maxSize + 'px';

  if (evt && 0 < evt.screenX && 0 < evt.screenY) {
    // Spawn ripple at mouse position
    var bound = evt.currentTarget.getBoundingClientRect();

    var x = evt.clientX - bound.left,
      y = evt.clientY - bound.top;

    ripple.style.left = x - maxSize / 2 + 'px';
    ripple.style.top = y - maxSize / 2 + 'px';
  } else {
    // Spawn centered ripple
    ripple.style.left = (this.clientWidth / 2 - maxSize / 2) + 'px';
    ripple.style.top = (this.clientHeight / 2 - maxSize / 2) + 'px';
  }

  ripple.classList.add('button-ripple');

  // prepend ripple
  this.insertBefore(ripple, this.childNodes[0]);

  // remove ripple
  setTimeout(() => {
    this.removeChild(ripple);
  }, 1000);
});

/**
 * Bind components
 */
function bindComponents() {
  const components = document.querySelectorAll('[jsaction]');

  Array.from(components).forEach((component, index) => {
    const actions = component.getAttribute('jsaction').split(';');

    actions.forEach((actionDefinition) => {
      actionDefinition = actionDefinition.split(':');

      let event = actionDefinition[0]
        , handler = actionDefinition[1];

      if (!handler) {
        handler = event;
        event = 'click';
      }

      if (_actions.get(handler)) {
        // mark as binded
        // component.setAttribute('jscache', index);

        // bind
        component.addEventListener(event, _actions.get(handler));
      } else if(event && handler) {
        console.error('The handler', handler, 'is not defined!');
      }
    });
  });
}

/**
 * Bind DOM
 */
document.addEventListener('DOMContentLoaded', () => {
  bindComponents();
}, false);