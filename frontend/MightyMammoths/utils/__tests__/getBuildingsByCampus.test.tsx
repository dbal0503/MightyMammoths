import campusBuildingCoords from '../../assets/buildings/coordinates/campusbuildingcoords.json';
import { getBuildingsByCampus } from '../getBuildingsByCampus';

describe('getBuildingsByCampus', () => {
  it('should group building names by campus using the real JSON data', () => {
    const result = getBuildingsByCampus();

    expect(result).toHaveProperty('SGW');
    expect(result).toHaveProperty('LOY');

    expect(Array.isArray(result.SGW)).toBe(true);
    expect(result.SGW.length).toBeGreaterThan(0);

    expect(result.SGW).toContain('H Building');   
    expect(result.SGW).toContain('LB Building');  

    expect(result.LOY.length).toBeGreaterThan(0);
    expect(result.LOY).toContain('AD Building');  

  });

  it('should handle an empty FeatureCollection gracefully', () => {
    const originalData = { ...campusBuildingCoords };
    (campusBuildingCoords as any).features = []; 

    const emptyResult = getBuildingsByCampus();
    expect(Object.keys(emptyResult).length).toBe(0);

    (campusBuildingCoords as any).features = originalData.features;
  });
});
