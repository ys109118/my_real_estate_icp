export default function Input({ type, placeholder, value, onChange, className }) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`border p-2 rounded ${className}`}
        />
    );
}