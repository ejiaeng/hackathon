
// Morse Code Map
const MORSE_MAP: { [key: string]: string } = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
  ' ': ' '
};

export interface MorseTiming {
  duration: number; // Duration of vibration (or 0 for silence)
  delay: number;    // Delay after this unit before the next one
}

/**
 * Converts text to a sequence of vibration durations and delays.
 * 
 * Standard Morse Timing:
 * - Dot: 1 unit
 * - Dash: 3 units
 * - Intra-character gap: 1 unit (silence)
 * - Inter-character gap: 3 units (silence)
 * - Word gap: 7 units (silence)
 * 
 * @param text The text to translate
 * @param wpm Words Per Minute (determines unit speed)
 * @returns Array of timing objects
 */
export function textToMorseVibrations(text: string, wpm: number = 20): MorseTiming[] {
  // T = 1200 / WPM
  const unit = 1200 / wpm; 
  
  const sequence: MorseTiming[] = [];
  const normalizedText = text.toUpperCase().replace(/[^A-Z0-9 ]/g, '');

  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i];
    
    if (char === ' ') {
      // Word gap (7 units)
      // Note: We just add a delay to the previous element or a dummy silence
      sequence.push({ duration: 0, delay: unit * 7 });
      continue;
    }

    const code = MORSE_MAP[char];
    if (!code) continue;

    for (let j = 0; j < code.length; j++) {
      const symbol = code[j];
      const isLastSymbol = j === code.length - 1;
      
      const duration = symbol === '.' ? unit : unit * 3;
      // Gap after symbol: 1 unit if within char, 3 units if end of char
      const delay = isLastSymbol ? unit * 3 : unit;

      sequence.push({ duration, delay });
    }
  }

  return sequence;
}
