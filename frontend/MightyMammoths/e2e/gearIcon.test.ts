import { device, expect, element, by, waitFor } from 'detox';

describe('Gear Icon visible', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: { location: 'always' } 
    });  
  });

  it('should display gear icon', async () => {
    await waitFor(element(by.id('gear-icon')))
      .toBeVisible()
      .withTimeout(20000);
    await expect(element(by.id('gear-icon'))).toBeVisible();
  });

});