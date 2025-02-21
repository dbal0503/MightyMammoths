import { device, expect, element, by, waitFor } from 'detox';

describe('Building Markers (Visible Markers Only)', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: { location: 'always' } 
    });
    
  });

  it('should display marker for GA Building', async () => {
    await waitFor(element(by.id('marker-GA')))
      .toBeVisible()
      .withTimeout(40000);

    await expect(element(by.id('marker-GA'))).toBeVisible();
  });
  it('should display marker text for GA Building', async () => {
    await waitFor(element(by.id('marker-text-GA')))
      .toBeVisible()
      .withTimeout(40000);

    await expect(element(by.id('marker-text-GA'))).toBeVisible();
  });
});