
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastAction,
} from "@/components/ui/toast"
import React from "react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Handle the action object format if it exists
        let actionElement = null;
        
        if (action) {
          if (React.isValidElement(action)) {
            actionElement = action;
          } else if (typeof action === 'object' && 'label' in action && 'onClick' in action) {
            const { label, onClick } = action as { label: string; onClick: () => void };
            actionElement = (
              <ToastAction altText={label} onClick={onClick}>
                {label}
              </ToastAction>
            );
          }
        }

        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {actionElement}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
