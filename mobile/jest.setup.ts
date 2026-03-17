import "@testing-library/jest-native/extend-expect";

// Silence noisy logs in test output
jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});
