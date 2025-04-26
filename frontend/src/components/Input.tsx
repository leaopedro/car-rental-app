export default function Input({
  label,
  id,
  type = "text",
  value,
  dark = false,
  onChange,
  onBlur,
}: {
  label: string;
  id: string;
  dark?: boolean;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) {
  const inputClass = `${dark ? "dark-icon " : ""}w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500`;
  return (
    <div className="flex-1">
      <label htmlFor={id} className="block mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={inputClass}
      />
    </div>
  );
}
