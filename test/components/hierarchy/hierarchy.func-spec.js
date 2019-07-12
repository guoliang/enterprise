import { Hierarchy } from '../../../src/components/hierarchy/hierarchy';
import { cleanup } from '../../helpers/func-utils';

const hierarchyHTML = require('../../../app/views/components/hierarchy/example-index.html');
const svg = require('../../../src/components/icons/svg.html');
const data = require('../../../app/data/orgstructure-original.json');

const legendData = [
  { value: 'FT', label: 'Full Time' },
  { value: 'PT', label: 'Part Time' },
  { value: 'C', label: 'Contractor' },
];

let hierarchyEl;
let hierarchyAPI;
const hierarchyId = '#hierarchy';

describe('hierarchy API', () => {
  beforeEach(() => {
    hierarchyEl = null;
    hierarchyAPI = null;

    document.body.insertAdjacentHTML('afterbegin', svg);
    document.body.insertAdjacentHTML('afterbegin', hierarchyHTML);

    hierarchyEl = document.body.querySelector(hierarchyId);

    hierarchyAPI = new Hierarchy(hierarchyEl, {
      templateId: 'hierarchyChartTemplate',
      legendKey: 'EmploymentType',
      legend: legendData,
      dataset: data
    });
  });

  afterEach(() => {
    cleanup(['.svg-icons', '#hierarchyChartTemplate', '#hierarchy', '#hierarchy-init-script', '.hierarchy']);

    hierarchyAPI.destroy();
  });

  it('Can be invoked', () => {
    expect(hierarchyAPI).toEqual(jasmine.any(Object));
  });

  it('Can be empty', () => {
    hierarchyAPI.destroy();
    hierarchyAPI = new Hierarchy(hierarchyEl, {
      dataset: []
    });

    expect(document.body.querySelector('.icon-empty-state')).toExist();
    expect(hierarchyEl.classList.contains('empty-message')).toBeTruthy();
  });

  it('Can render a legend', () => {
    expect(document.body.querySelectorAll('legend li').length).toEqual(3);
    expect(document.body.querySelector('legend li').innerText).toEqual('Full Time');
  });

  it('Can be destroyed', () => {
    hierarchyAPI.destroy();

    expect($(hierarchyEl).data('hierarchy')).toBeFalsy();
  });
});
