import campusBuildingCoords from "../assets/buildings/coordinates/campusbuildingcoords.json";
import { BuildingData } from "@/components/ui/input/AutoCompleteDropdown";

export const buildingList: BuildingData[] = campusBuildingCoords.features.map(
    ({ properties }) => ({
      buildingName: properties.BuildingName,
      placeID: properties.PlaceID || "",
    })
  );