import { toast } from "sonner";

const EXPLORER = "https://robinhoodchain.blockscout.com";

export function txSuccessToast(
  title: string,
  hash: string,
  description?: string
) {
  toast.success(title, {
    description: description ?? `${hash.slice(0, 18)}…`,
    duration: 8000,
    action: {
      label: "Explorer ↗",
      onClick: () => window.open(`${EXPLORER}/tx/${hash}`, "_blank"),
    },
  });
}

export function txErrorToast(message: string) {
  toast.error("Transaction failed", {
    description: message.length > 120 ? `${message.slice(0, 117)}…` : message,
    duration: 6000,
  });
}
