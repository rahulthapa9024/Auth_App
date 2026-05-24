import { FiLogOut, FiX } from "react-icons/fi";

interface ConfirmLogoutProps {
  open: boolean;
  loading: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmLogout({
  open,
  loading,
  error,
  onCancel,
  onConfirm,
}: ConfirmLogoutProps) {
  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
        px-4
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
    >
      <div
        className="
          w-full
          max-w-sm
          rounded-lg
          border
          border-zinc-800
          bg-zinc-950
          p-5
          shadow-2xl
        "
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                bg-red-500/15
                text-red-300
              "
            >
              <FiLogOut size={20} />
            </span>

            <div>
              <h2
                id="logout-title"
                className="text-lg font-semibold text-white"
              >
                Confirm sign out
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Your current session will be ended.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              rounded-md
              p-1
              text-zinc-500
              transition
              hover:bg-zinc-900
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label="Close logout confirmation"
          >
            <FiX size={18} />
          </button>
        </div>

        {error && (
          <div
            className="
              mt-5
              rounded-lg
              border
              border-red-400/30
              bg-red-500/10
              px-3
              py-2
              text-sm
              text-red-100
            "
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              rounded-lg
              border
              border-zinc-700
              px-4
              py-2
              text-sm
              font-semibold
              text-zinc-200
              transition
              hover:bg-zinc-900
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              rounded-lg
              bg-red-600
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}
