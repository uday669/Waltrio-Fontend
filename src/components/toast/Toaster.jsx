import React, { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";
import { subscribe, dismiss } from "../../lib/toast";
import "./toast.css";

const ICONS = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
  warning: FiAlertTriangle,
};

function ToastItem({ toast }) {
  const Icon = ICONS[toast.type] || FiInfo;
  return (
    <div className={`wt-toast wt-toast--${toast.type}`} role="alert">
      <span className="wt-toast__icon">
        <Icon size={20} />
      </span>
      <p className="wt-toast__msg">{toast.message}</p>
      <button
        type="button"
        className="wt-toast__close"
        aria-label="Dismiss"
        onClick={() => dismiss(toast.id)}
      >
        <FiX size={16} />
      </button>
      <span
        className="wt-toast__bar"
        style={{ animationDuration: `${toast.duration}ms` }}
      />
    </div>
  );
}

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => subscribe(setToasts), []);

  return (
    <div className="wt-toast-viewport" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
