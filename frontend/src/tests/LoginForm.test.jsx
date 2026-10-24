import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import LoginForm from "@/components/Auth/LoginForm";
import api from "@/lib/api";

// Replace the HTTP client; everything else (context, form, routing) is real.
vi.mock("@/lib/api", () => ({ default: { post: vi.fn() } }));

function renderLogin() {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/dashboard" element={<p>Dashboard page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

async function submitCredentials(email, password) {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText("Email"), email);
  await user.type(screen.getByPlaceholderText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Sign In" }));
}

describe("signing in", () => {
  beforeEach(() => {
    api.post.mockReset();
  });

  it("stores the session and goes to the dashboard on success", async () => {
    api.post.mockResolvedValue({
      data: { token: "jwt-from-server", user: { id: 1, email: "ada@example.test", role: "USER" } },
    });
    renderLogin();

    await submitCredentials("ada@example.test", "secret-password");

    expect(await screen.findByText("Dashboard page")).toBeTruthy();
    expect(api.post).toHaveBeenCalledWith("/api/auth/login", {
      email: "ada@example.test",
      password: "secret-password",
    });
    expect(localStorage.getItem("token")).toBe("jwt-from-server");
    expect(JSON.parse(localStorage.getItem("user")).email).toBe("ada@example.test");
  });

  it("shows the server's message and stays on the form when credentials are rejected", async () => {
    api.post.mockRejectedValue({ response: { status: 401, data: { message: "Invalid credentials" } } });
    renderLogin();

    await submitCredentials("ada@example.test", "wrong-password");

    expect(await screen.findByText("Invalid credentials")).toBeTruthy();
    expect(screen.queryByText("Dashboard page")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });
});
