interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
    const id = props.id || `input-${Math.random()}`;

    return (
        <div className="input-wrapper">
            {label && <label htmlFor={id}>{label}</label>}
            <input id={id} className={`input ${error ? 'input--error' : ''}`} {...props} />
            {error && <span className="input-error">{error}</span>}
        </div>
    );
}