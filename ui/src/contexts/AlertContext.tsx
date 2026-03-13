import { createContext, useContext, useCallback, type ReactNode } from "react";
import toast from "react-hot-toast";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertContextValue {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const showAlert = useCallback((message: string, type: AlertType = "info") => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast(message, { icon: "\u26A0\uFE0F" });
        break;
      case "info":
      default:
        toast(message, { icon: "\u2139\uFE0F" });
        break;
    }
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextValue {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
