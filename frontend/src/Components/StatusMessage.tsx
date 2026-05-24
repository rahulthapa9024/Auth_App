import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

interface StatusMessageProps {
  type: "error" | "success";
  message: string;
}

export default function StatusMessage({
  type,
  message,
}: StatusMessageProps) {
  const isError = type === "error";

  return (
    <div
      className={`
        mt-5
        flex
        items-start
        gap-3
        rounded-lg
        border
        px-4
        py-3
        text-sm
        ${isError
          ? "border-red-400/30 bg-red-500/10 text-red-100"
          : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"}
      `}
      role={isError ? "alert" : "status"}
    >
      <span className="mt-0.5 shrink-0">
        {isError ? (
          <FiAlertCircle size={17} />
        ) : (
          <FiCheckCircle size={17} />
        )}
      </span>

      <p className="m-0 leading-5">
        {message}
      </p>
    </div>
  );
}
