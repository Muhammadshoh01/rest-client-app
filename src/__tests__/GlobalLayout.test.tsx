import { render, screen } from "@testing-library/react";
import RootLayout from "../app/layout";
import { vi, describe, it, expect } from "vitest";

vi.mock("../globals.css", () => ({}));

vi.mock("next/font/google", () => ({
    Geist: () => ({ variable: "mock-geist-sans" }),
    Geist_Mono: () => ({ variable: "mock-geist-mono" }),
}));

vi.mock("next-intl", () => ({
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="intl-provider">{children}</div>
    ),
}));

describe("RootLayout", () => {
    it("renders children inside NextIntlClientProvider", () => {
        render(
            <RootLayout>
                <p>Test Child</p>
            </RootLayout>
        );
        expect(screen.getByText("Test Child")).toBeInTheDocument();
    });
});
