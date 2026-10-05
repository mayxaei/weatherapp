function Button({ children, onClick, className = '' }) {
    return (
        <button
            type="button"
            className={`custom-button ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    )
}

export default Button