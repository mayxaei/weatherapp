function Button({
    children,
    onClick,
    className = '',
    disabled = false
}) {
    return (
        <button
            type="button"
            className={`custom-button ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default Button;