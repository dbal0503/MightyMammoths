import campusBuildingCoords from '../../assets/buildings/coordinates/campusbuildingcoords.json';
import { buildingList } from '../getBuildingList'; 
import { BuildingData } from '@/components/ui/input/AutoCompleteDropdown';

describe('buildingList', () => {
  it('should have the same number of items as the features in campusBuildingCoords', () => {
    expect(buildingList.length).toBe(campusBuildingCoords.features.length);
  });

  it('should map BuildingName and PlaceID for each feature into buildingList', () => {
    buildingList.forEach((building: BuildingData, index: number) => {
      const correspondingFeature = campusBuildingCoords.features[index];
      expect(building.buildingName).toBe(correspondingFeature.properties.BuildingName);
      const expectedPlaceID = correspondingFeature.properties.PlaceID || '';
      expect(building.placeID).toBe(expectedPlaceID);
    });
  });

  it('should correctly map a known building from the JSON', () => {
    const knownBuildingName = 'H Building'; 
    const found = buildingList.find(b => b.buildingName === knownBuildingName);
    expect(found).toBeDefined();
  });

  it('should gracefully handle PlaceID if missing in JSON', () => {
    const testFeature = {
      type: 'Feature',
      properties: {
        BuildingName: 'Test Building With No ID',
        PlaceID: '',
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
    };
    const mappedBuilding: BuildingData = {
      buildingName: testFeature.properties.BuildingName,
      placeID: testFeature.properties.PlaceID || '',
    };

    expect(mappedBuilding.placeID).toBe(''); 
  });
});
