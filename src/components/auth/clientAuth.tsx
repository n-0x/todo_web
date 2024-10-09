import { Context, ContextType } from "react";

export function withAuth(comp: JSX.Element): JSX.Element {
    const hoc = (): JSX.Element => {
        return (
            <div>
                <h1>Hello from HOC</h1>
                <p>This is some content inside a Higher-Order Component.</p>
            </div>
        );
    }

    return hoc();
}