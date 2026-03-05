import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Manage your subscription and payment method
        </p>
      </div>

      <Card className="p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-zinc-900">Free plan</div>
            <p className="mt-1 text-sm text-zinc-600">
              1 site, 5 pages. Manual refresh only.
            </p>
          </div>
          <Button variant="outline">Upgrade to Pro</Button>
        </div>
      </Card>
    </div>
  );
}
