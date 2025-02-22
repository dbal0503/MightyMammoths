export async function isWithinRadius(
    userLatNum: number, 
    userLongNum: number 
  ): Promise<string> {
    const centerLocationSGW = [45.4953, -73.5788];
    const centerLocationLOY = [45.4583, -73.6408]; 
    const radius = 2500; // 2.5 km in meters
  
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const R = 6371000; 
  
    const userLatRad = toRadians(userLatNum);
    const userLongRad = toRadians(userLongNum);
  
    const latSGW = toRadians(centerLocationSGW[0]);
    const lonSGW = toRadians(centerLocationSGW[1]);
  
    const dlatSGW = latSGW - userLatRad;
    const dlonSGW = lonSGW - userLongRad;
  
    const aSGW =
      Math.sin(dlatSGW / 2) * Math.sin(dlatSGW / 2) +
      Math.cos(userLatRad) * Math.cos(latSGW) * Math.sin(dlonSGW / 2) * Math.sin(dlonSGW / 2);
    const cSGW = 2 * Math.atan2(Math.sqrt(aSGW), Math.sqrt(1 - aSGW));
  
    const distanceSGW = R * cSGW;
  
    if (distanceSGW <= radius) {
      return "SGW";
    }
  
    const latLOY = toRadians(centerLocationLOY[0]);
    const lonLOY = toRadians(centerLocationLOY[1]);
  
    const dlatLOY = latLOY - userLatRad;
    const dlonLOY = lonLOY - userLongRad;
  
    const aLOY =
      Math.sin(dlatLOY / 2) * Math.sin(dlatLOY / 2) +
      Math.cos(userLatRad) * Math.cos(latLOY) * Math.sin(dlonLOY / 2) * Math.sin(dlonLOY / 2);
    const cLOY = 2 * Math.atan2(Math.sqrt(aLOY), Math.sqrt(1 - aLOY));
  
    const distanceLOY = R * cLOY;
  
    if (distanceLOY <= radius) {
      return "LOY";
    }
  
    return ""; // User is outside the radius of both campuses
  }
  