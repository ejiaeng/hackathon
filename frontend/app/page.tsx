"use client";

import { requestAppPermissions } from "@/utils/permissions";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export default function Home() {
  const handlePermissions = async () => {
    // Vibrate to give feedback that button was pressed
    await Haptics.impact({ style: ImpactStyle.Medium });
    
    // Request permissions
    const results = await requestAppPermissions();
    if (results) {
      alert(`Permissions: Camera: ${results.camera}, Audio: ${results.audio}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Welcome to the Hackathon App
        </h1>
        <p className="text-slate-600 mb-8">
          Frontend running on Next.js + Capacitor
        </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={handlePermissions}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-200"
          >
            Setup Permissions
          </button>
        </div>
      </div>
    </main>
  );
}
