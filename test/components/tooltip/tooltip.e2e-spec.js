const { browserStackErrorReporter } = requireHelper('browserstack-error-reporter');
const utils = requireHelper('e2e-utils');
const config = require('../../helpers/e2e-config.js');

requireHelper('rejection');

jasmine.getEnv().addReporter(browserStackErrorReporter);

describe('Tooltips index page tests', () => {
  beforeEach(async () => {
    await utils.setPage('/components/tooltip/example-index?layout=nofrills');
  });

  it('should display when hovering the icon', async () => {
    await browser.actions()
      .mouseMove(await element(by.id('tooltip-btn')))
      .perform();

    await browser.driver
      .wait(protractor.ExpectedConditions.visibilityOf(await element(by.id('tooltip'))), config.waitsFor);

    expect(await element(by.id('tooltip')).getText()).toEqual('Tooltips Provide Additional Information');
  });

  if (utils.isChrome() && utils.isCI()) {
    it('Should not visual regress', async () => {
      await browser.actions().mouseMove(await element(by.id('tooltip-btn'))).perform();

      await browser.driver
        .wait(protractor.ExpectedConditions.visibilityOf(await element(by.id('tooltip'))), config.waitsFor);

      const containerEl = await element(by.className('container'));
      await browser.driver.sleep(config.sleep);

      expect(await browser.protractorImageComparison.checkElement(containerEl, 'tooltip-index')).toEqual(0);
    });
  }
});

describe('Tooltips on icon tests', () => {
  beforeEach(async () => {
    await utils.setPage('/components/icons/example-tooltips');
  });

  it('Should not have errors', async () => {
    await utils.checkForErrors();
  });

  it('should display a tooltip when hovering a button', async () => {
    await browser.actions()
      .mouseMove(await element(by.id('standalone-delete-icon')))
      .perform();

    await browser.driver
      .wait(protractor.ExpectedConditions.visibilityOf(await element(by.id('tooltip'))), config.waitsFor);

    expect(await element(by.id('tooltip')).getText()).toEqual('Send to Trashcan');
  });
});

describe('Tooltip (personalizable) tests', () => {
  beforeEach(async () => {
    await utils.setPage('/components/header/example-disabled-buttons?theme=soho&variant=dark&colors=206b62');
  });

  it('should not have errors', async () => {
    await utils.checkForErrors();
  });

  // Fixes Github Issue `infor-design/enterprise#3011`
  if (utils.isChrome() && utils.isCI()) {
    it('should have white tooltip text (and should not visually regress)', async () => {
      await browser.actions()
        .mouseMove(await element(by.id('header-more-actions')))
        .perform();

      await browser.driver
        .wait(protractor.ExpectedConditions.visibilityOf(await element(by.id('tooltip'))), config.waitsFor);
      const tooltipEl = await element(by.id('tooltip'));

      expect(await browser.protractorImageComparison.checkElement(tooltipEl, 'tooltip-personalized-text-color')).toEqual(0);
    });
  }
});
