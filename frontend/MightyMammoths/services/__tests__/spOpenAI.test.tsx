import { generatePlanFromChatGPT, TaskPlan } from '../spOpenAI';
import { DistanceResult } from '../smartPlannerDistancePairs';
import { Task } from '@/components/ui/types';


global.fetch = jest.fn();

describe('generatePlanFromChatGPT', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate plan from ChatGPT successfully', async () => {
    // 1) Arrange: set up all inputs
    const tasks: Task[] = [
      { id: 1, name: 'Start Location', location: 'Hall Building', locationPlaceID: 'StartID', time: '9:00', type: 'Start' },
      { id: 2, name: 'Library Study', location: 'Library Building', locationPlaceID: 'LibID', time: '10:00', type: 'Study' }
    ];

    const distanceDurationArr: DistanceResult[] = [
      {
        from: 'Hall Building',
        fromPlaceID: 'StartID',
        to: 'Library Building',
        toPlaceID: 'LibID',
        distance: '500 m',
        duration: '6 mins'
      }
    ];

    const sgwCampusBuildings = ['Hall Building', 'Library Building'];
    const loyCampusBuildings = ['VL Building'];

    const mockOpenAIResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify([
              {
                order: 0,
                taskName: 'Start Location',
                taskLocation: 'Hall Building',
                taskTime: '9:00',
                taskType: 'Start',
                origin: '',
                originPlaceID: '',
                destination: '',
                destinationPlaceID: '',
                completed: false
              },
              {
                order: 1,
                taskName: 'Library Study',
                taskLocation: 'Library Building',
                taskTime: '10:00',
                taskType: 'Study',
                origin: 'Hall Building',
                originPlaceID: 'StartID',
                destination: 'Library Building',
                destinationPlaceID: 'LibID',
                completed: false
              }
            ])
          }
        }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOpenAIResponse
    });

    const result: TaskPlan[] = await generatePlanFromChatGPT(
      tasks,
      distanceDurationArr,
      sgwCampusBuildings,
      loyCampusBuildings
    );

    expect(result.length).toBe(2);
    expect(result[0]).toMatchObject({
      order: 0,
      taskName: 'Start Location',
      taskLocation: 'Hall Building',
      completed: false
    });
    expect(result[1]).toMatchObject({
      order: 1,
      taskName: 'Library Study',
      taskLocation: 'Library Building',
      completed: false
    });
  });

  it('should throw an error if the response is not OK', async () => {
    const tasks: Task[] = [];
    const distanceDurationArr: DistanceResult[] = [];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request'
    });

    await expect(
      generatePlanFromChatGPT(tasks, distanceDurationArr, [], [])
    ).rejects.toThrow('OpenAI API error: Bad Request');
  });

  it('should throw an error if JSON parsing fails or invalid content is returned', async () => {
    const tasks: Task[] = [];
    const distanceDurationArr: DistanceResult[] = [];

    const mockOpenAIResponse = {
      choices: [
        {
          message: {
            content: 'Not valid JSON at all'
          }
        }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOpenAIResponse
    });

    await expect(
      generatePlanFromChatGPT(tasks, distanceDurationArr, [], [])
    ).rejects.toThrow(SyntaxError);
  });
});