import { Link } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletPageHeader } from "@/routes/_wallet";

export function ComingSoonWallet({
  title,
  subtitle,
  back = "/wallet",
}: {
  title: string;
  subtitle?: string;
  back?: string;
}) {
  return (
    <div>
      <WalletPageHeader title={title} subtitle={subtitle} back={back} />
      <div className="mx-5 mt-8 rounded-2xl border bg-card p-8 text-center shadow-card">
        <Construction className="mx-auto h-7 w-7 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Polishing this screen</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Available in the next iteration of the demo.
        </p>
        <Button asChild variant="outline" className="mt-5 rounded-full">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link to={back as any}>Back</Link>
        </Button>
      </div>
    </div>
  );
}
