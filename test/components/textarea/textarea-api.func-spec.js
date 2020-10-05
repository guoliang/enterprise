import { Textarea } from '../../../src/components/textarea/textarea';

const textareaHTML = require('../../../app/views/components/textarea/example-index.html');
const svg = require('../../../src/components/icons/svg.html');

let textareaEl;
let svgEl;
let textareaObj;

describe('Textarea API', () => {
  beforeEach(() => {
    textareaEl = null;
    svgEl = null;
    textareaObj = null;
    document.body.insertAdjacentHTML('afterbegin', svg);
    document.body.insertAdjacentHTML('afterbegin', textareaHTML);
    textareaEl = document.body.querySelector('#description');
    svgEl = document.body.querySelector('.svg-icons');
    textareaObj = new Textarea(textareaEl);
  });

  afterEach(() => {
    textareaObj.destroy();
    const row = document.body.querySelector('.row');
    row.parentNode.removeChild(row);
    svgEl.parentNode.removeChild(svgEl);
  });

  it('Should be defined', () => {
    expect(textareaObj).toEqual(jasmine.any(Object));
  });

  it('Should destroy textarea', () => {
    textareaObj.destroy();

    expect($(textareaEl).data('textarea')).toBeFalsy();
    expect(textareaEl.parentNode.children.length).toEqual(2);
  });

  it('Should disable textarea', () => {
    textareaObj.disable();

    expect(textareaEl.disabled).toBeTruthy();
    expect(textareaObj.isDisabled()).toBeTruthy();
  });

  it('Should enable textarea', () => {
    textareaObj.enable();

    expect(textareaEl.disabled).toBeFalsy();
    expect(textareaEl.readOnly).toBeFalsy();
    expect(textareaObj.isDisabled()).toBeFalsy();
  });

  it('Should render textarea readonly', () => {
    textareaObj.readonly();

    expect(textareaEl.disabled).toBeFalsy();
    expect(textareaEl.readOnly).toBeTruthy();
    expect(textareaObj.isDisabled()).toBeFalsy();
  });

  it('Should update a print version', () => {
    textareaEl.value = 'This is a test \n This is a test \n This is a test \n This is a test \n This is a test';
    textareaObj.updateCounter();

    expect(textareaObj.printarea[0].innerHTML).toEqual(textareaEl.value);
  });
});
