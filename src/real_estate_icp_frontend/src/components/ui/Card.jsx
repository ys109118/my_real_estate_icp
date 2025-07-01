export default function Card({ children, onClick, className }) {
    return (
        <div
            onClick={onClick}
            className={`border rounded-lg p-4 shadow-md cursor-pointer ${className}`}
        >
            {children}
        </div>
    );
}