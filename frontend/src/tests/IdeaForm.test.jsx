import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdeaForm from "@/components/Ideas/_IdeaForm";

describe("IdeaForm", () => {
  it("submits the title and description the user typed", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<IdeaForm onSubmit={onSubmit} onCancel={() => {}} submitting={false} />);

    await user.type(screen.getByPlaceholderText("Summarize your idea..."), "Dark mode");
    await user.type(screen.getByPlaceholderText("Tell us more about your suggestion..."), "Easier at night");
    await user.click(screen.getByRole("button", { name: "Submit Feedback" }));

    expect(onSubmit).toHaveBeenCalledWith({ title: "Dark mode", description: "Easier at night" });
  });

  it("does not submit whitespace-only input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<IdeaForm onSubmit={onSubmit} onCancel={() => {}} submitting={false} />);

    await user.type(screen.getByPlaceholderText("Summarize your idea..."), "   ");
    await user.type(screen.getByPlaceholderText("Tell us more about your suggestion..."), "   ");
    await user.click(screen.getByRole("button", { name: "Submit Feedback" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables submission while a submission is in progress", () => {
    render(<IdeaForm onSubmit={() => {}} onCancel={() => {}} submitting={true} />);

    expect(screen.getByRole("button", { name: "Submitting..." }).disabled).toBe(true);
  });
});
