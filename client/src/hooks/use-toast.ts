// Simplified toast system without React hooks to avoid hook errors
interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

// Simple console-based toast for now to avoid React hook issues
function toast({ title, description, variant }: ToastProps) {
  console.log(`🍞 Toast [${variant || 'default'}]:`, title, description);
  return {
    id: Date.now().toString(),
    dismiss: () => {},
    update: () => {},
  };
}

function useToast() {
  return {
    toasts: [],
    toast,
    dismiss: () => {},
  };
}

export { useToast, toast }
