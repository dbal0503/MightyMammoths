export function getIndoorMapUrl(buildingName: string): string {
  if (buildingName === "H Building") {
    return "https://app.mappedin.com/map/677d8a736e2f5c000b8f3fa6?embedded=true";
  }
  return "No link available";
  //if this is the case, instead of the building popping up,
  //show an alert that says "No indoor map available for this building yet"
}
