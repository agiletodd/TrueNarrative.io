import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import RequireAuth from "@/components/Auth/RequireAuth";

function renderProtectedPage() {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <p>Private dashboard</p>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("RequireAuth", () => {
  it("sends a visitor without a session to the login page", async () => {
    renderProtectedPage();

    expect(await screen.findByText("Login page")).toBeTruthy();
    expect(screen.queryByText("Private dashboard")).toBeNull();
  });

  // Known bug W5 (fixed in Phase 3): RequireAuth ignores the context's
  // loading state, so it redirects before the stored session is restored.
  // it.fails passes while the bug exists; switch it to it() with the fix.
  it.fails("shows the page to a user with a stored session", async () => {
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("user", JSON.stringify({ id: 1, email: "ada@example.test" }));

    renderProtectedPage();

    expect(await screen.findByText("Private dashboard")).toBeTruthy();
  });
});
