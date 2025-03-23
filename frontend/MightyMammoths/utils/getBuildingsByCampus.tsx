import campusBuildingCoords from "../assets/buildings/coordinates/campusbuildingcoords.json";

export const getBuildingsByCampus = (): Record<string, string[]> => {
    const campuses: Record<string, string[]> = {};
  
    campusBuildingCoords.features.forEach(({ properties }: any) => {
      const { Campus, BuildingName } = properties;
      if (!campuses[Campus]) {
        campuses[Campus] = [];
      }
      campuses[Campus].push(BuildingName);
    });
  
    return campuses;
  };