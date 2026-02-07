'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Camera as CapCamera, CameraResultType } from '@capacitor/camera';
import { getApiUrl } from '@/utils/api';
import { textToMorseVibrations } from '@/utils/morse';

type InfoLevel = 'SUMMARY' | 'STANDARD' | 'DETAILED';
const INFO_LEVELS: InfoLevel[] = ['SUMMARY', 'STANDARD', 'DETAILED'];

export default function MultiInputCapture() {
  const [infoLevelIdx, setInfoLevelIdx] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingMorse, setIsPlayingMorse] = useState(false);
  const [status, setStatus] = useState<string>('Ready (Video Mode)');
  const [wpm, setWpm] = useState(20); // Default 20 WPM
  
  const infoLevel = INFO_LEVELS[infoLevelIdx];
  const recordingRef = useRef(false);
  const photoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingMorseRef = useRef(false);

  // Signal "Ready" state with haptics on mount
  useEffect(() => {
    const signalReady = async () => {
      await triggerHaptic('notification', NotificationType.Success);
      console.log('📱 APP: System Ready Haptic Triggered');
    };
    signalReady();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (photoIntervalRef.current) clearInterval(photoIntervalRef.current);
    };
  }, []);

  const triggerHaptic = async (type: 'impact' | 'notification' | 'vibrate', style?: ImpactStyle | NotificationType | number) => {
    try {
      if (type === 'impact') {
        await Haptics.impact({ style: style as ImpactStyle });
      } else if (type === 'notification') {
        await Haptics.notification({ type: style as NotificationType });
      } else if (type === 'vibrate') {
        await Haptics.vibrate({ duration: style as number });
      }
    } catch (e) {
      console.warn('Haptics not available', e);
    }
  };

  const takePhotoAndSend = async () => {
    try {
      console.log('📸 APP: Capturing frame...');
      const image = await CapCamera.getPhoto({
        quality: 40, // Reduced quality slightly for stability
        allowEditing: false,
        resultType: CameraResultType.Base64,
        width: 480 // Smaller width for emulator performance
      });

      if (image.base64String) {
        console.log('📤 APP: Sending frame to backend...');
      
        // Send as JSON with Base64 to match Spring Boot Backend
        const response = await fetch(getApiUrl('/api/analysis/image'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: image.base64String,
            detailLevel: infoLevel
          })
        });
  
        if (response.ok) {
          const data = await response.json();
          // Backend returns { "description": "text..." }
          if (data.description && recordingRef.current) {
              console.log('✅ Backend Response:', data);
              stopRecordingAndPlayMorse(data.description); 
          }
        }
      }
    } catch (e) {
      console.error('❌ Camera/Upload Error:', e);
      setStatus('Error: Camera not responding');
    }
  };

  const startMorsePlayback = async (text: string) => {
    setIsPlayingMorse(true);
    isPlayingMorseRef.current = true;
    setStatus(`Playing: "${text}"`);

    const sequence = textToMorseVibrations(text, wpm); // Use state WPM

    for (const step of sequence) {
      if (!isPlayingMorseRef.current) break; // Stop if user released
      
      if (step.duration > 0) {
        await triggerHaptic('vibrate', step.duration);
      }
      // Wait for duration + delay
      await new Promise(resolve => setTimeout(resolve, step.duration + step.delay));
    }
    
    setIsPlayingMorse(false);
    isPlayingMorseRef.current = false;
  };

  const stopRecordingAndPlayMorse = (text: string) => {
    if (photoIntervalRef.current) {
      clearInterval(photoIntervalRef.current);
      photoIntervalRef.current = null;
    }
    setIsRecording(false);
    startMorsePlayback(text);
  };

  const startRecording = async () => {
    if (recordingRef.current) return;
    
    recordingRef.current = true;
    setIsRecording(true);
    setStatus('Recording Video Stream...');
    
    // Initial Tick
    await triggerHaptic('impact', ImpactStyle.Light);

    // Loop: Photo every 250ms + Haptic Tick
    photoIntervalRef.current = setInterval(async () => {
        if (!recordingRef.current) return;
        
        // Haptic Heartbeat
        await triggerHaptic('impact', ImpactStyle.Light);
        
        // Capture & Send
        await takePhotoAndSend();
    }, 250);
  };

  const stopRecording = () => {
    console.log('🛑 Stopping');
    recordingRef.current = false;
    setIsRecording(false);
    isPlayingMorseRef.current = false; // Stop Morse if playing
    
    if (photoIntervalRef.current) {
      clearInterval(photoIntervalRef.current);
      photoIntervalRef.current = null;
    }
    setStatus('Ready (Video Mode)');
  };

  const bind = useGesture({
    onDrag: ({ swipe: [, swipeY], active }) => {
      if (active) return;
      
      if (swipeY === 1 && infoLevelIdx > 0) {
        setInfoLevelIdx(prev => prev - 1);
        triggerHaptic('impact', ImpactStyle.Medium);
      } else if (swipeY === -1 && infoLevelIdx < INFO_LEVELS.length - 1) {
        setInfoLevelIdx(prev => prev + 1);
        triggerHaptic('impact', ImpactStyle.Heavy);
      }
    },
    onPointerDown: () => {
      // Start a timer for 0.25s hold
      const timer = setTimeout(() => {
        startRecording();
      }, 250);
      
      // Store timer to clear if released early
      (window as any).holdTimer = timer;
    },
    onPointerUp: () => {
      clearTimeout((window as any).holdTimer);
      stopRecording();
    },
    onPointerCancel: () => {
      clearTimeout((window as any).holdTimer);
      stopRecording();
    }
  }, {
    drag: { swipe: { distance: 40, velocity: 0.2 } },
    // Handle double tap for testing
     onPointerDown: ({ event }: { event: any }) => {
       if (event.detail === 2 && !isRecording && !isPlayingMorse) {
         startMorsePlayback("READY");
       }
     }
  });

  return (
    <div 
      {...bind()} 
      className="fixed inset-0 w-full h-full bg-black touch-none flex flex-col items-center justify-center overflow-hidden font-sans"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Scanning Line Effect */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ top: '-10%' }}
              animate={{ top: '110%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.5)] z-20"
            />
          )}
        </AnimatePresence>

        {/* Ambient Glow */}
        <motion.div 
          animate={{ 
            opacity: isRecording ? 0.4 : 0.1,
            scale: isRecording ? 1.2 : 1
          }}
          className={`absolute inset-0 transition-colors duration-700 ${
            isRecording ? 'bg-red-900/20' : isPlayingMorse ? 'bg-green-900/20' : 'bg-blue-900/10'
          } blur-3xl`}
        />
      </div>

      {/* Camera Corner Brackets (UI Aesthetic) */}
      <div className="absolute inset-8 border-white/10 border-2 pointer-events-none rounded-3xl">
        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white/40 rounded-tl-lg" />
        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white/40 rounded-tr-lg" />
        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white/40 rounded-bl-lg" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white/40 rounded-br-lg" />
      </div>

      {/* Main Content Area */}
      <div className="z-10 text-center flex flex-col items-center gap-12 max-w-xs w-full px-6">
        
        {/* Status Text with Dynamic Layout */}
        <div className="relative h-32 flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={isRecording ? 'rec' : isPlayingMorse ? 'morse' : infoLevel}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <h1 className={`text-7xl font-black tracking-tight leading-none ${
                isRecording ? 'text-red-500' : isPlayingMorse ? 'text-green-400' : 'text-white'
              }`}>
                {isRecording ? 'REC' : isPlayingMorse ? 'MSG' : infoLevel.charAt(0)}
              </h1>
              <span className="text-xs font-bold tracking-[0.3em] uppercase opacity-40 mt-2">
                {isRecording ? 'Active Scan' : isPlayingMorse ? 'Receiving Morse' : `${infoLevel} MODE`}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Info Level Pills */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex items-center gap-3">
            {INFO_LEVELS.map((level, i) => (
              <motion.div 
                key={level}
                animate={{ 
                  scale: i === infoLevelIdx ? 1.2 : 1,
                  opacity: i === infoLevelIdx ? 1 : 0.2
                }}
                className={`h-2 w-12 rounded-full ${
                  i === infoLevelIdx ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-white'
                }`}
              />
            ))}
          </div>
          
          <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <p className="text-[10px] font-medium text-white/60 tracking-wider uppercase">
              {infoLevelIdx === 0 ? 'Brief Description' : infoLevelIdx === 1 ? 'Standard Context' : 'High Detail Mode'}
            </p>
          </div>
        </div>
      </div>

      {/* Instruction Footer */}
      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-4">
        <motion.p 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-[9px] text-white/40 font-bold uppercase tracking-[0.25em]"
        >
          {isRecording ? 'Hold to continue scanning' : 'Long Press Screen to Scan'}
        </motion.p>
        
        <div className="h-[1px] w-8 bg-white/20" />

        <div className="text-slate-500 font-mono text-[9px] tracking-[0.1em] px-8 text-center max-w-xs uppercase">
          {status}
        </div>
      </div>

      {/* Vibration Pulse Ripple */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 0.25 }}
            className="absolute z-0 w-64 h-64 border-2 border-red-500/30 rounded-full"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
