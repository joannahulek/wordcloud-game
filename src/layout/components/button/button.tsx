interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
}

export function Button({
    variant = 'primary',
    size = 'medium',
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`button button--${variant} button--${size}`}
            {...props}
        >
            {children}
        </button>
    );
}