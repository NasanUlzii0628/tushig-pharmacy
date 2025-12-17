import { LoginForm } from "../_components/login-form";

export default function LoginV1() {
  return (
    <div className="flex item-center justify-center min-h-screen relative">
      <div className="bg-background flex w-full items-center justify-center p-8 lg:w-2/3">
        <div className="w-full max-w-md space-y-10 py-2 lg:py-32">
          <div className="space-y-4 text-center">
            <div className="font-medium text-2xl tracking-tight">БАРАА ЗАХИАЛГЫН СИСТЕМ</div>
          </div>
          <div className="space-y-4">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 text-sm text-muted-foreground">
        @2025 Түшиг барилгын материал
      </div>
    </div>
  );
}