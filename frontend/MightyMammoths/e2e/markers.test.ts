import { device, expect, element, by, waitFor } from 'detox';

describe('Building Markers (Visible Markers Only)', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  const visibleMarkers = 'FB Building'; 

    it(`should display marker for ${visibleMarkers}`, async () => {
      await waitFor(element(by.id(`marker-${visibleMarkers}`)))
        .toBeVisible()
        .withTimeout(5000);
      await expect(element(by.id(`marker-${visibleMarkers}`))).toBeVisible();
});
});