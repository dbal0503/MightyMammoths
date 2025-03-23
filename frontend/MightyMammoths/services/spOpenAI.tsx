import { DistanceResult } from "./smartPlannerDistancePairs";
import { Task } from "@/components/ui/types";

export type TaskPlan = {
    taskName: string;
    taskLocation: string;
    taskTime?: string;
    taskType: string;
    origin?: string;
    destination?: string;
    order: number;
    completed?: boolean;
  }
  
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPEN_AI_KEY;

export const generatePlanFromChatGPT = async (
    tasks: Task[],
    distanceDurationArr: DistanceResult[],
    sgwCampusBuildings: string[],
    loyCampusBuildings: string[],
    ): Promise<TaskPlan[]> => {
    const sgwBuildingsDesc = sgwCampusBuildings.join(', ');
    const loyBuildingsDesc = loyCampusBuildings.join(', ');

    const startTask = tasks.find(task => task.name === 'Start Location');
    const actualTasks = tasks.filter(task => task.name !== 'Start Location');

    const tasksDescription = actualTasks
        .map(task => `- ${task.name} (Location: ${task.location}, Time: ${task.time}, Type: ${task.type})`)
        .join('\n');

    const distancesDescription = distanceDurationArr
        .map(dd => `- From ${dd.from} to ${dd.to}: ${dd.distance}, duration ${dd.duration}`)
        .join('\n');

    const prompt = `You are tasked to create an optimal plan to complete tasks with the shortest total distance and duration.

        Start Location:
        - ${startTask?.location}

        Tasks to complete:
        ${tasksDescription}

        Distances and durations:
        ${distancesDescription}

        Campus Buildings:
        - SGW Campus: ${sgwBuildingsDesc}
        - LOY Campus: ${loyBuildingsDesc}

        Notes:
        - Tasks with location \"Any SGW campus building\", \"Any LOY campus building\", or \"Any campus building\" should be assigned the most efficient building from the provided campus buildings and the distance data. 
        If there is no distance data then calculate the estimated distance and duration using the buildings from the respetive campus. Note that all buildings are in Montreal, Canada.
        - Some tasks may not be time-sensitive and you will know this because some tasks will not have an associated time; prioritize optimizing overall travel distance and duration.
        
        IMPORTANT: Format your response as a raw JSON array without any markdown formatting, code blocks, or backticks.
        Return the response as a JSON array of objects with the following fields:
            - order (the order of the task in the plan starting from 1, and the start location task should be 0)
            - taskName
            - taskLocation
            - taskTime (the scheduled time for the task)
            - taskType (as provided in the input)
            - origin
            - destination
            - completed (a boolean indicating whether the task has been completed but set this to false for all tasks)`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 500,
        }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const messageContent = data.choices[0].message.content;
        const cleanedContent = messageContent.replace(/```json\s*|\s*```/g, '').trim();
        console.log('Cleaned content:', cleanedContent);

        const taskPlan: TaskPlan[] = JSON.parse(cleanedContent);
        return taskPlan;

    } catch (error) {
        console.error('Error generating plan from ChatGPT: ', error);
        throw error;
    }
};