import { Pill, Syringe, Stethoscope, Plus, Activity } from "lucide-react";

import { LoginForm } from "../_components/login-form";

export default function LoginV1() {
  return (
    <div className="bg-primary text-primary-foreground relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute right-0 bottom-0 hidden h-[440px] w-[440px] overflow-hidden md:block">
        <div className="bg-primary-foreground/[0.05] absolute -right-24 -bottom-24 h-[420px] w-[420px] rounded-full blur-3xl" />

        <Pill
          className="text-primary-foreground/[0.12] absolute -right-12 -bottom-16 h-[240px] w-[240px] -rotate-[20deg]"
          strokeWidth={0.9}
        />
        <Syringe
          className="text-primary-foreground/[0.14] absolute right-[170px] bottom-[40px] h-[150px] w-[150px] rotate-[35deg]"
          strokeWidth={0.9}
        />

        <Stethoscope
          className="text-primary-foreground/[0.12] absolute right-[40px] bottom-[200px] h-[130px] w-[130px] -rotate-[12deg]"
          strokeWidth={0.9}
        />

        <Plus
          className="text-primary-foreground/[0.18] absolute right-[180px] bottom-[180px] h-[34px] w-[34px]"
          strokeWidth={1.6}
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,white,transparent_55%)] opacity-[0.04]" />

      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 sm:top-10 sm:left-10 sm:gap-3">
        <div className="bg-primary-foreground/10 ring-primary-foreground/10 flex h-9 w-9 items-center justify-center rounded-xl ring-1 backdrop-blur sm:h-10 sm:w-10">
          <Activity className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
        </div>
        <span className="text-xs font-semibold tracking-[0.2em] uppercase sm:text-sm">
          Түшиг Эмийн Сан
        </span>
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 pt-20 pb-8 sm:p-6">
        <div className="bg-background text-foreground flex w-full max-w-[460px] flex-col justify-center rounded-sm p-6 shadow-2xl sm:aspect-square sm:p-10">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
              Түшиг эмийн сан
              <br />
              системд тавтай морилно уу!
            </h2>
          </div>

          <LoginForm />
        </div>
      </div>

    </div>
  );
}
