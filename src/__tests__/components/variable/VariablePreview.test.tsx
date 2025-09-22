
import { render, screen } from "@testing-library/react";
import VariablePreview from "../../../components/variable/variablePreview";
import { vi, describe, it, expect } from "vitest";
import React from "react";

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => {
        const dict: Record<string, string> = {
            preview: "Preview",
            original: "Original",
            resolved: "Resolved",
            unresolvedWarning: "Unresolved variables remain",
        };
        return dict[key] || key;
    },
}));

describe("VariablePreview", () => {
    const variables = [
        { id: "1", name: "name", value: "Alice", enabled: true },
        { id: "2", name: "age", value: "30", enabled: true },
    ];

    it("returns null if text is empty", () => {
        const { container } = render(
            <VariablePreview text="" variables={variables} label="Test" />
        );
        expect(container.firstChild).toBeNull();
    });

    it("returns null if text has no variables", () => {
        const { container } = render(
            <VariablePreview text="Hello World" variables={variables} label="Test" />
        );
        expect(container.firstChild).toBeNull();
    });

    it("renders original and resolved when variables are replaced", () => {
        render(
            <VariablePreview
                text="Hello {{name}}, you are {{age}}"
                variables={variables}
                label="Greeting"
            />
        );

        expect(screen.getByText(/Greeting Preview/)).toBeInTheDocument();
        expect(screen.getByText(/Original:/)).toBeInTheDocument();
        expect(screen.getByText(/Resolved:/)).toBeInTheDocument();

        expect(screen.getByText("Hello {{name}}, you are {{age}}")).toBeInTheDocument();

        expect(screen.getByText("Hello Alice, you are 30")).toBeInTheDocument();

        const resolved = screen.getByText("Hello Alice, you are 30");
        expect(resolved).toHaveClass("bg-green-100");
    });

    it("shows warning and red style when unresolved variables remain", () => {
        render(
            <VariablePreview
                text="Hello {{name}}, you are {{age}} and live in {{city}}"
                variables={variables}
                label="Greeting"
            />
        );

        expect(screen.getByText(/Unresolved variables remain/)).toBeInTheDocument();

        const unresolved = screen.getByText("Hello Alice, you are 30 and live in {{city}}");
        expect(unresolved).toHaveClass("bg-red-100");
    });

    it("applies custom className", () => {
        const { container } = render(
            <VariablePreview
                text="Hello {{name}}"
                variables={variables}
                label="Test"
                className="custom-class"
            />
        );
        expect(container.firstChild).toHaveClass("custom-class");
    });
});
