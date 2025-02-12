import { device, expect, element, by, waitFor } from 'detox';

describe('Building Markers (Visible Markers Only)', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: { location: 'always' } 
    });
    
  });

  it('should display marker for FB Building', async () => {
    await waitFor(element(by.id('marker-FB')))
      .toBeVisible()
      .withTimeout(20000);

    await expect(element(by.id('marker-FB'))).toBeVisible();
  });

  it('should display multiple building markers', async () => {
    const buildingMarkers = [
      'marker-EV',
      'marker-TD',
      'marker-FG',
      'marker-GA',
      'marker-GNL',
      'marker-B',
    ];

    for (const markerId of buildingMarkers) {
      await waitFor(element(by.id(markerId)))
        .toBeVisible()
        .withTimeout(20000);
      await expect(element(by.id(markerId))).toBeVisible();
    }
  });
});
