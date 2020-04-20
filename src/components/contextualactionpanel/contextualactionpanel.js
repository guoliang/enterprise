import * as debug from '../../utils/debug';
import { utils } from '../../utils/utils';
import { warnAboutDeprecation } from '../../utils/deprecated';
import { Locale } from '../locale/locale';

import '../icons/icons.jquery';

const COMPONENT_NAME = 'contextualactionpanel';

/**
* A more complex modal for complex in page interactions.
* @class ContextualActionPanel
* @param {string} element The component element.
* @param {string} settings The component settings.
* @param {jQuery|string} [settings.content = null] Pass content through to CAP.
* @param {boolean} [settings.initializeContent = true] Initialize content before opening with defaults.
* @param {string} [settings.title = 'Contextual Action Panel'] String that sits in the toolbar's title field.
* @param {object} [settings.modalSettings = {}] an object containing settings for the internal Modal component.
* @param {array} [settings.modalSettings.buttons = null] A list of buttons that will sit in the toolbar's Buttonset area.
* @param {boolean} [settings.modalSettings.centerTitle = false] If true the title will be centered.
* @param {string} [settings.modalSettings.id = `contextual-action-modal-[number]`] The id to use for the CAP, or defaults to generated.
* @param {boolean} [settings.modalSettings.showCloseBtn = false] if true, displays a "close (X)" button in the button row that cancels the CAP's Modal action.
* @param {string} [settings.modalSettings.trigger = 'click'] Can be 'click' or 'immediate'.
* @param {boolean} [settings.modalSettings.useFlexToolbar = false] If true the new flex toolbar will be used (For CAP)
*/
const CONTEXTUALACTIONPANEL_DEFAULTS = {
  content: null,
  initializeContent: true, // initialize content before opening
  title: 'Contextual Action Panel',
  modalSettings: {
    buttons: null,
    centerTitle: false,
    id: `contextual-action-modal-${parseInt($('.modal').length, 10) + 1}`,
    showCloseBtn: false,
    trigger: 'click',
    useFlexToolbar: false
  }
};

// List of settings that used to reside directly underneath the `defaults`, but have
// been re-located to `settings.modalSettings` as of v4.22.x.
// See `infor-design/enterprise#2433` for more information.
// TODO: find a way to normalize CAP's `content` setting with Modal's.  For some reason,
// they are different and have been that way for some time.
const CONTEXTUAL_MODAL_SETTINGS = [
  'buttons',
  'centerTitle',
  'id',
  'showCloseButton',
  'trigger',
  'useFlexToolbar',
];

// Handles the conversion of legacy CAP settings to `modalSettings` setting.
function handleLegacyCAPSettings(settings) {
  // Some settings are renamed to match their Modal counterparts
  const conversionMap = {
    showCloseButton: 'showCloseBtn'
  };

  CONTEXTUAL_MODAL_SETTINGS.forEach((setting) => {
    if ([null, undefined].indexOf(settings[setting]) === -1) {
      let targetSettingName = setting;

      if (!settings.modalSettings) {
        settings.modalSettings = {};
      }
      if (conversionMap[setting]) {
        // Convert a differently-named setting to the correct name
        targetSettingName = conversionMap[setting];
        settings.modalSettings[targetSettingName] = settings[setting];
      } else {
        // Simply append the actual setting
        settings.modalSettings[setting] = settings[setting];
      }
      delete settings[setting];
      warnAboutDeprecation(`settings.modalSettings.${targetSettingName}`, `settings.${setting}`);
    }
  });

  return settings;
}

function ContextualActionPanel(element, settings) {
  this.settings = utils.mergeSettings(element, settings, CONTEXTUALACTIONPANEL_DEFAULTS);
  this.settings = handleLegacyCAPSettings(this.settings);
  this.element = $(element);
  debug.logTimeStart(COMPONENT_NAME);
  this.init();
  debug.logTimeEnd(COMPONENT_NAME);
}

// Plugin Methods
ContextualActionPanel.prototype = {

  /**
   * @returns {Modal|undefined} instance of an IDS modal, or undefined if one doesn't exist
   */
  get modalAPI() {
    let api;
    if (this.panel && this.panel.length) {
      api = this.panel.data('modal');
    }
    return api;
  },

  /**
  * Initialize the CAP.
  * @private
  */
  init() {
    this
      .setup()
      .build()
      .handleEvents();
  },

  /**
  * Setup internal variables.
  * NOTE: Does not do any building.
  * @private
  * @returns {object} The Api for chaining.
  */
  setup() {
    let existingPanel = this.element.next('.contextual-action-panel');
    const dataModal = this.element.data('modal');
    const setPanel = (id) => {
      const panelFromID = $(`#${id}`);
      if (panelFromID.length) {
        existingPanel = panelFromID;
      }
    };
    if (typeof dataModal === 'string') {
      setPanel(dataModal);
    } else if (typeof dataModal === 'object') {
      setPanel(this.element.attr('data-modal'));
    }

    // Handle case with popup triggered from a menu
    if (this.element.closest('.popupmenu').length === 1) {
      existingPanel = this.element.closest('.popupmenu').next('.contextual-action-panel');
    }

    if (existingPanel[0]) {
      existingPanel[0].style.display = 'none';
      existingPanel.addClass('is-animating');
      this.panel = existingPanel;
    }

    return this;
  },

  /**
  * Add markup to build up the component.
  * @private
  * @returns {object} The Api for chaining.
  */
  build() {
    const self = this;
    const modalContent = this.settings.content;

    // Build the Content if it's not present
    if (!this.panel || !this.panel.length) {
      if (modalContent instanceof jQuery) {
        if (modalContent.is('.contextual-action-panel')) {
          this.panel = modalContent;
        } else {
          modalContent.wrap('<div class="contextual-action-panel"></div>');
          this.panel = modalContent.parent();
        }

        this.panel.addClass('modal').appendTo('body');

        if (modalContent.is('iframe')) {
          modalContent.ready(() => {
            self.completeBuild();
            modalContent.show();
          });
          return self;
        }
        modalContent.show();
      } else {
        this.panel = $(`<div class="contextual-action-panel">${modalContent}</div>`).appendTo('body');
        this.panel.addClass('modal').attr('id', this.settings.modalSettings.id);
      }
    }

    this.completeBuild();
    return this;
  },

  /**
  * Finalize build up/
  * @private
  * @returns {object} The Api for chaining.
  */
  completeBuild() {
    let children;
    let isIframe = false;
    let contents;
    let hasSearchfield = false;
    let predefined = true;

    // Invoke Icons
    this.panel.find('svg').icon();

    // Get a reference to `.modal-content`
    const modalContent = this.panel.find('.modal-content');
    if (modalContent.length === 0) {
      children = this.panel.children();
      if (children.is('iframe')) {
        contents = children.contents();
        this.toolbar = contents.find('.toolbar, .flex-toolbar');
        isIframe = true;
      }

      if (!isIframe) {
        children.wrapAll('<div class="modal-content"></div>').wrapAll('<div class="modal-body"></div>');
        this.panel.addClass('modal');
      }
    }

    // Build/reference the header
    let modalHeader = this.panel.find('.modal-header');
    if (modalHeader.length === 0) {
      modalHeader = $('<div class="modal-header"></div>');
      modalHeader.insertBefore(this.panel.find('.modal-body'));
    }
    this.header = modalHeader;

    // Detect existence of buttonset for later
    let buttonset = this.panel.find('.toolbar .buttonset, .flex-toolbar .buttonset');

    // Build/reference the CAP header toolbar
    if (!this.toolbar) {
      this.toolbar = this.panel.find('.toolbar, .flex-toolbar');
    }
    if (!this.toolbar.length) {
      predefined = false;
      if (this.settings.modalSettings.buttons) {
        this.settings.modalSettings.buttons.forEach((button) => {
          if (button.type === 'input') {
            hasSearchfield = true;
          }
        });
      }

      if (this.settings.title && this.settings.modalSettings.centerTitle) {
        const toolbarSearchfieldSection = hasSearchfield ? '<div class="toolbar-section search"></div>' : '';
        const toolbarHTML = `<div class="flex-toolbar">
          <div class="toolbar-section static"></div>
          <div class="toolbar-section title center-text">
            <h2>${this.settings.title}</h2>
          </div>
          ${toolbarSearchfieldSection}
          <div class="toolbar-section buttonset static"></div>
        </div>`;

        this.toolbar = $(toolbarHTML);
      } else if (!buttonset.length) {
        const toolbarCSSClass = this.settings.modalSettings.useFlexToolbar ? 'flex-toolbar' : 'toolbar';
        const toolbarTitleSection = this.settings.modalSettings.useFlexToolbar ? `<div class="toolbar-section title"><h2>${this.settings.title}</h2></div>` : '';
        const toolbarButtonsetCSSClass = this.settings.modalSettings.useFlexToolbar ? 'toolbar-section buttonset' : 'buttonset';
        const toolbarButtonsetSection = `<div class="${toolbarButtonsetCSSClass}"></div>`;
        const toolbarSearchfieldSection = this.settings.modalSettings.useFlexToolbar && hasSearchfield ? '<div class="toolbar-section search"></div>' : '';
        const toolbarHTML = `<div class="${toolbarCSSClass}">
          ${toolbarTitleSection}
          ${toolbarSearchfieldSection}
          ${toolbarButtonsetSection}
        </div>`;

        const toolbar = $(toolbarHTML);
        toolbar.appendTo(this.panel.find('.modal-header'));
        this.toolbar = toolbar;
        buttonset = toolbar.children('.buttonset');
      }
    }
    this.toolbar.appendTo(this.header);

    // Only add certain elements if a Toolbar was generated with JS-options
    // and not by HTML markup.
    if (!predefined) {
      if (!buttonset || !buttonset.length && !this.settings.modalSettings.centerTitle) {
        buttonset = $('<div class="toolbar-section buttonset"></div>');
        buttonset.appendTo(this.toolbar);
      }

      let toolbarTitle = this.toolbar.find('.title');
      if (!toolbarTitle.length) {
        const centerTextCSS = this.settings.modalSettings.centerTitle ? ' center-text' : '';
        toolbarTitle = $(`
          <div class="toolbar-section title${centerTextCSS}">
            <h2>${this.settings.title}</h2>
          </div>
        `);

        if (buttonset) {
          toolbarTitle.insertBefore(buttonset);
        } else {
          this.toolbar.prepend(toolbarTitle);
        }
      }

      if (!toolbarTitle.length) {
        toolbarTitle = $(`
          <div class="title">
            ${this.settings.title}
          </div>
        `);
        this.toolbar.prepend(toolbarTitle);
      }
    }

    // Move to the body element to break stacking context issues.
    if (!isIframe) {
      this.panel.detach().appendTo('body');
    }

    this.element.attr('data-modal', this.settings.modalSettings.id);
    if (!this.panel.attr('id')) {
      this.panel.attr('id', this.settings.modalSettings.id);
    }

    // Invoke the underlying Modal API
    this.panel.modal(this.settings.modalSettings);

    this.buttons = this.panel.find('.buttonset').children('button');

    this.closeButton = this.panel.find('.modal-header').find('.btn-close, [name="close"], button.close-button');
    if (this.settings.modalSettings.showCloseBtn && !this.closeButton.length) {
      const closeText = Locale.translate('Close');
      this.closeButton = $(`
        <button class="btn-close" type="button" title="${closeText}">
          ${$.createIcon('close')}
          <span class="audible">${closeText}</span>
        </button>
      `);

      if (!this.settings.modalSettings.useFlexToolbar) {
        buttonset.append(this.closeButton);
      } else {
        const standaloneSection = $('<div class="toolbar-section static"></div>').append(this.closeButton);
        const more = this.toolbar.find('.toolbar-section.more');
        standaloneSection.insertAfter(more.length ? more : buttonset);
      }
    }

    if (this.closeButton.length) {
      this.toolbar.addClass('has-close-button');
    }

    if (this.toolbar.is('.toolbar')) {
      this.toolbar.toolbar();
    }
    if (this.toolbar.is('.flex-toolbar')) {
      this.toolbar.toolbarflex();
    }

    utils.fixSVGIcons(this.element);
    return this;
  },

  /**
  * Attach event handlers.
  * @private
  * @returns {object} The Api for chaining.
  */
  handleEvents() {
    const self = this;

    // Convenience method that takes an event from the Modal control's panel element,
    // and triggers any listeners that may be looking at the Contextual Action Panel's
    // trigger instead.
    function passEvent(e) {
      self.element.triggerHandler(e.type);
    }

    this.panel.addClass('is-animating')
      .off('open.contextualactionpanel')
      .on('open.contextualactionpanel', (e) => {
        passEvent(e);
        self.panel.removeClass('is-animating');
      })
      .off('close.contextualactionpanel')
      .on('close.contextualactionpanel', (e) => {
        passEvent(e);
      })
      .off('beforeopen.contextualactionpanel')
      .on('beforeopen.contextualactionpanel', function (e) {
        if (self.settings.initializeContent) {
          $(this).initialize();
        }
        passEvent(e);
      })
      .off('afteropen.contextualactionpanel')
      .on('afteropen.contextualactionpanel', () => {
        if (self.toolbar) {
          self.toolbar.trigger('recalculate-buttons');
        }

        // Select the proper element on the toolbar
        if (self.toolbar.length) {
          let selected = self.toolbar.find('.buttonset > .is-selected');
          if (!selected.length) {
            selected = self.toolbar.find('.buttonset > *:first-child');
            if (selected.is('.searchfield-wrapper')) {
              selected = selected.children('.searchfield');
            }
          }
          if (!selected.length && self.toolbar.is('.flex-toolbar')) {
            selected = self.toolbar.find('button').first();
            selected.focus();
            return;
          }
          const toolbarData = self.toolbar.data('toolbar');
          if (toolbarData) {
            toolbarData.setActiveButton(selected, true);
          }
        }

        // Focus the first focusable element inside the Contextual Panel's Body
        self.panel.find('.modal-body-wrapper').find(':focusable').first().focus();
        utils.fixSVGIcons(self.panel);
      });

    if (self.closeButton && self.closeButton.length) {
      self.closeButton.on('click.contextualactionpanel', () => {
        self.handleToolbarSelected();
      });
    }

    return this;
  },

  /**
  * Toolbar select event handler.
  * @private
  * @returns {void}
  */
  handleToolbarSelected() {
    this.close();
  },

  /**
  * Detach events and restore markup.
  * @private
  * @returns {void}
  */
  teardown() {
    const self = this;
    const buttonset = self.toolbar.children('.buttonset');

    this.panel.off('open.contextualactionpanel close.contextualactionpanel ' +
      'beforeopen.contextualactionpanel afterclose.contextualactionpanel');

    buttonset.children('*:not(.searchfield)')
      .off('click.contextualactionpanel');

    const menuButtons = buttonset.children('.btn-menu');
    menuButtons.each(function () {
      const popup = $(this).data('popupmenu');
      if (popup) {
        popup.destroy();
      }
    });

    if (self.header) {
      self.header.remove();
    }

    const children = self.panel.find('.modal-body').children();
    children.first().unwrap().unwrap();

    self.element.removeAttr('data-modal');

    if (self.closeButton && self.closeButton.length) {
      self.closeButton.off('click.contextualactionpanel');
      delete self.closeButton;
    }

    // Trigger an afterclose event on the Contextual Action Panel's trigger element
    // (different from the panel, which is already removed).
    self.element.trigger('afterteardown');
  },

  /**
  * Close the Contextual Action Panel if open and call destroy.
  * @returns {void}
  */
  close() {
    let destroy;
    if (this.settings.modalSettings.trigger === 'immediate') {
      destroy = true;
    }

    if (this.modalAPI) {
      this.modalAPI.close(destroy);
    }
  },

  /**
  * Add a disabled attribute to the main component element.
  * @returns {void}
  */
  disable() {
    this.element.prop('disabled', true);
    if (this.panel.hasClass('is-visible')) {
      this.close();
    }
  },

  /**
  * Remove disabled attribute from the main component element.
  * @returns {void}
  */
  enable() {
    this.element.prop('disabled', false);
  },

  /**
   * Update the component and optionally apply new settings.
   *
   * @param  {object} settings the settings to update to.
   * @returns {object} The plugin api for chaining.
   */
  updated(settings) {
    this.settings = utils.mergeSettings(this.element, settings, this.settings);
    this.settings = handleLegacyCAPSettings(this.settings);
    this.setup();

    if (this.modalAPI) {
      this.modalAPI.updated(this.settings.modalSettings);
    }
    return this;
  },

  /**
  * Destroy and remove added markup and events
  * @returns {void}
  */
  destroy() {
    // ModalAPI calls `capAPI.teardown()` at the correct timing
    if (this.modalAPI && this.modalAPI.isOpen) {
      this.modalAPI.close(true);
    }
    $.removeData(this.element[0], COMPONENT_NAME);
  }
};

export { ContextualActionPanel, COMPONENT_NAME };
