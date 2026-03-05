import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Update your profile and preferences
        </p>
      </div>

      <Card className="p-8">
        <form className="space-y-6">
          <Input label="Name" name="name" placeholder="Your name" />
          <Input label="Email" name="email" type="email" disabled />
          <Input label="Username" name="username" placeholder="your-username" />
          <Button type="submit">Save changes</Button>
        </form>
      </Card>
    </div>
  );
}
