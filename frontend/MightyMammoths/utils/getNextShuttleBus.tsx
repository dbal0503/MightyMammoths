import busSchedule from "./shuttleBusSchedule.json"; 


interface BusSchedule {
  [day: string]: {
    [campus: string]: string[];
  };
}

function timeToNumber(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 100 + minutes;
  }

export function findNextBusTime(day: string, campus: string, currentTime: string): string | null {
  const schedule: string[] | undefined = (busSchedule as BusSchedule)[day]?.[campus];

  // Handles the case for when day is Sunday or Saturday
  if (!schedule) {
    console.error("Invalid day or campus");
    return null;
  }

  //console.log("Schedule:", schedule);
  //console.log("Current time:", currentTime);
  //console.log("Campus:", campus);
  //console.log("Day:", day);

  const currentTimeNum = timeToNumber(currentTime);
  //console.log("Current time num:", currentTimeNum)

  let left = 0;
  let right = schedule.length - 1;

  const firstBusNum = timeToNumber(schedule[left]);
  const lastBusNum = timeToNumber(schedule[right]);
  //console.log("First bus num:", firstBusNum);
    //console.log("Last bus num:", lastBusNum);

  if (currentTimeNum > lastBusNum) {
    return "No more buses today";
  }

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midTimeNum = timeToNumber(schedule[mid]);

    if (midTimeNum >= currentTimeNum) {
      right = mid - 1;
    } else {
      left = mid + 1; 
    }
  }
  //console.log("Left:", left)
  //console.log("Left:", schedule[left])

  return schedule[left] || "No more buses today";
}
