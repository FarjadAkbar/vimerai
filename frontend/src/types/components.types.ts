// Component prop types

export interface GeneratorProps {
  mode?: "preview" | "full";
  showPreviewOverlay?: boolean;
  header?: React.ReactNode;
  showSubscriptionInfo?: boolean;
  showRecentVideos?: boolean;
  onSuccess?: (jobId: string) => void;
  className?: string;
}

export interface SmartPreviewModalProps {
  previewUrl: string;
  onClose: () => void;
}

export interface SubscriptionInfoProps {
  plan: string;
  videosRemaining: number;
}

export interface BlockedStateInfo {
  message: string;
  cta: { text: string; href: string } | null;
  secondaryCta?: { text: string; href: string };
  variant: "default" | "destructive" | "info";
}

export interface BlockedStateAlertProps {
  blockedStateInfo: BlockedStateInfo;
}
