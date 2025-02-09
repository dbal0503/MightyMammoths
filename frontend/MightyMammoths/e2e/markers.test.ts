import campusBuildingCoords from '../assets/buildings/coordinates/campusbuildingcoords.json';
import { device, expect, element, by } from 'detox';



describe('Building Markers', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  
    campusBuildingCoords.features.forEach((feature) => {
    const buildingName = feature.properties.BuildingName;

   
    it(`should display marker for ${buildingName}`, async () => {
      
      await waitFor(element(by.id(`marker-${buildingName}`)))
        .toBeVisible()
        .withTimeout(5000);
      
      
      await expect(element(by.id(`marker-${buildingName}`))).toBeVisible();
    });
  });
});
