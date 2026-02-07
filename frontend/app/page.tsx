"use client";

import { requestAppPermissions } from "@/utils/permissions";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import SplashScreenHandler from '@/components/SplashScreenHandler';
import MultiInputCapture from '@/components/MultiInputCapture';

export default function Home() {
  return (
    <main className="fixed inset-0 w-full h-full bg-slate-950 overflow-hidden">
      <SplashScreenHandler />
      <MultiInputCapture />
    </main>
  );
}
