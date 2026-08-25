// Tiny framework-agnostic toast store (react-hot-toast style).
// Call toast.success("..."), toast.error(err), etc. from anywhere —
// components, hooks, or plain functions. <Toaster /> renders them.

let toasts = [];
const listeners = new Set();
let idSeq = 0;

const emit = () => listeners.forEach((l) => l(toasts));

export function subscribe(listener) {
  listeners.add(listener);
  listener(toasts);
  return () => listeners.delete(listener);
}

export function dismiss(id) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

// Accepts a string, an Error, or an ApiError and returns a clean message.
function toMessage(input, fallback) {
  if (!input) return fallback;
  if (typeof input === "string") return input;
  return input.message || fallback;
}

function push(type, input, fallback, options = {}) {
  const id = ++idSeq;
  const message = toMessage(input, fallback);
  const duration = options.duration ?? (type === "error" ? 5000 : 3500);

  toasts = [...toasts, { id, type, message, duration }];
  emit();

  if (duration !== Infinity) {
    setTimeout(() => dismiss(id), duration);
  }
  return id;
}

export const toast = {
  success: (msg, opts) => push("success", msg, "Success", opts),
  error: (msg, opts) => push("error", msg, "Something went wrong", opts),
  info: (msg, opts) => push("info", msg, "", opts),
  warning: (msg, opts) => push("warning", msg, "", opts),
  dismiss,
};

export default toast;
