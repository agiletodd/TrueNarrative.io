import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount rendered components and clear the stored session between tests.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
