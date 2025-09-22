
import { render, screen } from "@testing-library/react";
import ErrorPage from "../../app/error/page";
import { vi, expect, it, describe } from "vitest";
import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            "ErrorPage.title": "Something went wrong",
            "ErrorPage.description": "Please try again later.",
            "ErrorPage.reasons_title": "Possible reasons:",
            "ErrorPage.reasons.invalid_credentials": "Invalid credentials",
            "ErrorPage.reasons.network_issues": "Network issues",
            "ErrorPage.reasons.server_unavailable": "Server unavailable",
            "ErrorPage.reasons.account_verification": "Account verification required",
            "ErrorPage.back_to_login": "Back to login",
            "ErrorPage.create_account": "Create an account",
            "ErrorPage.go_home": "Go home",
        };
        return messages[key] ?? key;
    },
}));

vi.mock('next/link', () => ({
    default: ({ href, children, ...rest }: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

describe("ErrorPage", () => {
    it("renders the error title and description", () => {
        render(<ErrorPage />);
        expect(
            screen.getByRole("heading", { name: /something went wrong/i })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/please try again later/i)
        ).toBeInTheDocument();
    });

    it("renders the reasons list", () => {
        render(<ErrorPage />);
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        expect(screen.getByText(/network issues/i)).toBeInTheDocument();
        expect(screen.getByText(/server unavailable/i)).toBeInTheDocument();
        expect(screen.getByText(/account verification required/i)).toBeInTheDocument();
    });

    it("renders navigation links with correct href", () => {
        render(<ErrorPage />);
        expect(screen.getByRole("link", { name: /back to login/i })).toHaveAttribute(
            "href",
            "/login"
        );
        expect(
            screen.getByRole("link", { name: /create an account/i })
        ).toHaveAttribute("href", "/signup");
        expect(screen.getByRole("link", { name: /go home/i })).toHaveAttribute(
            "href",
            "/"
        );
    });
});
