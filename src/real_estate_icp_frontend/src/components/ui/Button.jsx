export default function Button({ onClick, children, className }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 bg-blue-600 text-white rounded ${className}`}
        >
            {children}
        </button>
    );
}