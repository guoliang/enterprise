import { Homepage } from '../../../src/components/homepage/homepage';
import { cleanup } from '../../helpers/func-utils';

const scenarioMHTML = require('../../../app/views/components/homepage/example-scenario-m.html');

const targetId = 'test-homepage';
let homepageEl;
let homepageAPI;
let hasEventListeners = false;

describe('Homepage API', () => {
  beforeEach(() => {
    document.body.classList.add('no-scroll');
  });

  afterEach(() => {
    if (hasEventListeners) {
      $(`#${targetId}`).off('resize');
      hasEventListeners = false;
    }

    if (homepageAPI instanceof Homepage) {
      homepageAPI.destroy();
      homepageAPI = null;
    }

    cleanup(['.homepage', '.page-container']);
    homepageEl = null;
  });

  it('can pass metadata about its state through a `resize` event', (done) => {
    homepageEl = document.createElement('div');
    homepageEl.id = targetId;
    homepageEl.classList.add('homepage');
    document.body.appendChild(homepageEl);

    const spyEvent = spyOnEvent(`#${targetId}`, 'resize');

    // Sets up an actual event listener to get the contents of the metadata property
    let metadata;
    hasEventListeners = true;
    $(`#${targetId}`).on('resize', (e, offsetHeight, data) => {
      metadata = data;
    });

    homepageAPI = new Homepage(homepageEl, {});

    setTimeout(() => {
      expect(spyEvent).toHaveBeenTriggered();
      expect(metadata).toBeDefined();
      expect(metadata.cols).toBeDefined();
      expect(metadata.containerHeight).toBeDefined();
      expect(metadata.matrix).toBeDefined();
      expect(metadata.rows).toBeDefined();
      expect(metadata.blocks).toBeDefined();
      expect(metadata.editing).toBeDefined();
      done();
    }, 0);
  });

  it('correctly accounts for an empty row in a height calculation', (done) => {
    document.body.insertAdjacentHTML('afterbegin', scenarioMHTML);
    homepageEl = document.querySelector('.homepage');
    homepageEl.id = targetId;

    let metadata;
    hasEventListeners = true;
    $(`#${targetId}`).on('resize', (e, offsetHeight, data) => {
      metadata = data;
    });

    // Forces a fixed width on the `.homepage` container
    homepageEl.style.width = '780px';

    homepageAPI = new Homepage(homepageEl, {});

    setTimeout(() => {
      expect(metadata.matrix.length).toEqual(4);
      expect(metadata.rows).toEqual(3);
      expect(metadata.containerHeight).toEqual(1190);
      done();
    }, 0);
  });

  it('can be initialized with editing enabled', (done) => {
    homepageEl = document.createElement('div');
    homepageEl.id = targetId;
    homepageEl.classList.add('homepage');
    document.body.appendChild(homepageEl);

    let metadata;
    hasEventListeners = true;
    $(`#${targetId}`).on('resize', (e, offsetHeight, data) => {
      metadata = data;
    });

    homepageAPI = new Homepage(homepageEl, { editing: true });

    setTimeout(() => {
      expect(metadata.editing).toEqual(true);
      done();
    }, 0);
  });

  it('can enable editing mode using setEdit()', (done) => {
    homepageEl = document.createElement('div');
    homepageEl.id = targetId;
    homepageEl.classList.add('homepage');
    document.body.appendChild(homepageEl);

    homepageAPI = new Homepage(homepageEl, {});

    setTimeout(() => {
      expect(homepageAPI.state.editing).toEqual(false);
      homepageAPI.setEdit(true);

      expect(homepageAPI.state.editing).toEqual(true);
      done();
    }, 0);
  });
});
