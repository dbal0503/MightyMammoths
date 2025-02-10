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

  if (!schedule) {
    console.log("Invalid day or campus");
    return null;
  }

  const currentTimeNum = timeToNumber(currentTime);

  let left = 0;
  let right = schedule.length - 1;

  const lastBusNum = timeToNumber(schedule[right]);

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

  return schedule[left] || "No more buses today";
}
