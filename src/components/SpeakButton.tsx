interface SpeakButtonProps {
  text: string;
  label?: string;
}

let speechRequestId = 0;

function canSpeak(): boolean {
  return typeof window !== "undefined"
    && "speechSynthesis" in window
    && "SpeechSynthesisUtterance" in window;
}

function findEnglishVoice(synthesis: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  const voices = synthesis.getVoices();
  const americanVoice = voices.find((voice) => voice.lang.toLowerCase() === "en-us")
    ?? voices.find((voice) => /^en-us[-_]/i.test(voice.lang));
  return americanVoice ?? voices.find((voice) => /^en(-|_)/i.test(voice.lang));
}

export function speakEnglish(text: string): void {
  if (!canSpeak() || !text.trim()) return;

  const synthesis = window.speechSynthesis;
  const requestId = ++speechRequestId;
  synthesis.cancel();

  const speak = () => {
    if (requestId !== speechRequestId) return;
    const englishVoice = findEnglishVoice(synthesis);
    if (!englishVoice) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.voice = englishVoice;
    synthesis.speak(utterance);
  };

  if (synthesis.getVoices().length > 0) {
    speak();
    return;
  }

  let timeoutId: number | undefined;
  const handleVoicesChanged = () => {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    synthesis.removeEventListener("voiceschanged", handleVoicesChanged);
    speak();
  };
  synthesis.addEventListener("voiceschanged", handleVoicesChanged);
  timeoutId = window.setTimeout(() => {
    synthesis.removeEventListener("voiceschanged", handleVoicesChanged);
    speak();
  }, 500);
}

export function SpeakButton({ text, label = "英語を再生" }: SpeakButtonProps) {
  if (!canSpeak()) return null;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        speakEnglish(text);
      }}
      style={{
        position: "absolute",
        right: "8px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "32px",
        height: "32px",
        padding: 0,
        border: "1px solid var(--line)",
        borderRadius: "50%",
        background: "var(--paper)",
        color: "var(--teal-dark)",
        fontSize: "15px",
        lineHeight: 1,
        cursor: "pointer",
      }}
    >
      🔊
    </button>
  );
}
