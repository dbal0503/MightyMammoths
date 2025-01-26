describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have welcome screen', async () => {
    await expect(element(by.id('welcome'))).toBeVisible();
  });

  it('Should show step 2 on the welcome screen', async () => {
    await expect(element(by.id('step2'))).toBeVisible();
  });

  it('Should show step 3 on the welcome screen', async () => {
    await expect(element(by.id('step3'))).toBeVisible();
  });
});
