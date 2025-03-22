import axios from "axios";
import { autoCompleteSearch, getPlaceDetails } from "../searchService";

jest.mock('axios');

describe('autoCompleteSearch', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('returns empty array if API key is missing', async () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    const result = await autoCompleteSearch('Anything');
    expect(result).toEqual([]);
    expect(axios).not.toHaveBeenCalled();
  });
});

describe('getPlaceDetails', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('returns undefined if API key is missing', async () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    const result = await getPlaceDetails('123');
    expect(result).toBeUndefined();
    expect(axios).not.toHaveBeenCalled();
  });
});