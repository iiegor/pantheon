'use strict';

/**
 * JavaScript action handlers
 */
let JSActions = {
  /**
   * @namespace tooltip
   */
  'tooltip.show': function(evt) {
    this.classList.add('show-tooltip');
  },

  'tooltip.hide': function(evt) {
    this.classList.remove('show-tooltip');
  },

  /**
   * @namespace modal
   */
  'modal.close': function(evt) {
    document.getElementById('modal-dialog').remove();
  },

  /**
   * @namespace login
   * @note Handles login modal events
   */
  'login.tab': function(evt) {
    const contents = document.querySelector('[jsname="modal-contents"]');
    contents.style.width = '350px';
    contents.style.height = '286px';

    const tabpanel = document.querySelector('[role="tabpanel"]');
    tabpanel.querySelector('[data-tab-id="1"]').innerHTML = 'amazing';

    const tablist = document.querySelectorAll('[role="tablist"] .login-tab-selected');
    tablist.forEach(tab => {
      tab.classList.remove('login-tab-selected');
      tab.classList.add('login-tab-unselected');
    });

    const tabtitle = this.querySelector('[jsname="tab-title"]');
    tabtitle.classList.remove('login-tab-unselected');
    tabtitle.classList.add('login-tab-selected');
  },

  /**
   * @namespace ripple
   */
  'ripple.play': function(evt) {
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
  }
};

/**
 * Bind DOM load event
 */
document.addEventListener('DOMContentLoaded', () => {

  /**
   * Bind components
   */
  const components = document.querySelectorAll('[jsaction]');

  components.forEach((component, index) => {
    const actions = component.getAttribute('jsaction').split(';');

    actions.forEach((actionDefinition) => {
      actionDefinition = actionDefinition.split(':');

      let evt = actionDefinition[0]
        , action = actionDefinition[1];

      if (!action) {
        action = evt;
        evt = 'click';
      }

      if (JSActions.hasOwnProperty(action)) {
        // mark as binded
        component.setAttribute('jscache', index);

        // bind
        component.addEventListener(evt, JSActions[action]);
      } else if(evt && action) {
        console.error('The action', action, 'is not defined!');
      }
    });
  });
}, false);