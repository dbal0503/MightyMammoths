import { device, expect, element, by, waitFor } from 'detox';

describe('Gear Icon visible', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: { location: 'always' } 
    });
    await new Promise(resolve => setTimeout(resolve, 5000));  
  });

  it('should display gear icon', async () => {
    console.log("Checking if gear icon exists...");
    await waitFor(element(by.id('gear-icon')))
      .toExist()
      .withTimeout(40000);
      console.log("Gear icon exists, checking visibility...");
    await expect(element(by.id('gear-icon'))).toBeVisible();
  });

});