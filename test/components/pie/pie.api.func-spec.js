import { triggerContextmenu } from '../../helpers/func-utils';
import { Pie } from '../../../src/components/pie/pie';

const pieHTML = require('../../../app/views/components/pie/example-index.html');
const svg = require('../../../src/components/icons/svg.html');

let pieEl;
let svgEl;
let pieObj;

const dataset = [{
  data: [{
    name: 'Item A',
    value: 10.1,
    id: 'ca',
    tooltip: 'Item A <b>{{percent}}</b>'
  }, {
    name: 'Item B',
    value: 12.2,
    id: 'cb',
    tooltip: 'Item B <b>{{percent}}</b>'
  }, {
    name: 'Item C',
    value: 14.35,
    tooltip: 'Item C <b>{{percent}}</b>'
  }, {
    name: 'Item D',
    value: 15.6,
    tooltip: 'Item D <b>{{percent}}</b>'
  }, {
    name: 'Item E',
    value: 21.6,
    tooltip: 'Item E <b>{{percent}}</b>'
  }, {
    name: 'Item F',
    value: 41.6,
    tooltip: 'Item F <b>{{percent}}</b>'
  }]
}];

describe('Pie Chart API', () => {
  beforeEach(() => {
    pieEl = null;
    svgEl = null;
    pieObj = null;
    document.body.insertAdjacentHTML('afterbegin', svg);
    document.body.insertAdjacentHTML('afterbegin', pieHTML);
    pieEl = document.body.querySelector('#pie-chart-example');
    svgEl = document.body.querySelector('.svg-icons');

    pieObj = new Pie(pieEl, { type: 'pie', dataset });
  });

  afterEach(() => {
    pieObj.destroy();
    svgEl.parentNode.removeChild(svgEl);
    pieEl.parentNode.removeChild(pieEl);

    const rowEl = document.body.querySelector('.row');
    rowEl.parentNode.removeChild(rowEl);
  });

  it('Should fire contextmenu event', () => {
    const spyEvent = spyOnEvent(pieEl, 'contextmenu');
    const result = { name: 'Item A', value: 10.1, id: 'ca', tooltip: 'Item A <b>{{percent}}</b>' };
    $(pieEl).on('contextmenu', (e, el, d) => {
      expect(d.data).toEqual(jasmine.objectContaining(result));
    });
    triggerContextmenu(document.body.querySelector('.slice'));

    expect(spyEvent).toHaveBeenTriggered();
  });
});
