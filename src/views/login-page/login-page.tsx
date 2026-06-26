import { Input } from "../../layout/components/input/input.tsx";
import { Button } from "../../layout/components/button/button.tsx";
import React from "react";

export function LoginPage() {
    const [name, setName] = React.useState('');

    const handlePlay = () => {
        if (name.trim()) { /* empty */ }
    };

    return (
        <div data-test="login-page" className="login-page">
            <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="Player name"
            />
            <Button onClick={handlePlay} disabled={!name.trim()}>
                Play
            </Button>
        </div>
    )
}
