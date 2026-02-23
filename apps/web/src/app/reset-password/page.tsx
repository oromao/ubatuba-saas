import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordShell />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordShell() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redefinir senha</CardTitle>
          <CardDescription>Crie uma nova senha segura.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Nova senha" type="password" disabled />
          <Button className="w-full" disabled>
            Carregando...
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
