import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            "Loading.title": "Loading…",
            "Loading.description": "Please wait while we fetch your data.",
        };
        return messages[key] || key;
    },
}));

import Loading from "../app/loading";

describe("Loading Page", () => {
    it("renders loading title and description", () => {
        render(<Loading />);
        expect(screen.getByText("Loading…")).toBeInTheDocument();
        expect(
            screen.getByText("Please wait while we fetch your data.")
        ).toBeInTheDocument();
    });

    it("renders animated loader elements", () => {
        render(<Loading />);

        const spinners = document.querySelectorAll(".animate-spin");
        expect(spinners.length).toBeGreaterThan(0);

        const dots = document.querySelectorAll(".animate-bounce");
        expect(dots.length).toBe(3);
    });
});
