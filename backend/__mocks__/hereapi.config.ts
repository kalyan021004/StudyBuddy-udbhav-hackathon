// __mocks__/hereapi.config.ts
export const getPolylines = jest.fn().mockResolvedValue(["mocked_polyline"]);
export const getTrafficFactor = jest.fn().mockResolvedValue({ congestion_score: 2 });
export const getWeather = jest.fn().mockResolvedValue(5);
