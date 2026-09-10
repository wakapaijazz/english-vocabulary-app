interface SpeakButtonProps {
  text: string;
  label?: string;
}

function canSpeak(): boolean {
  return typeof window !== "undefined"
    && "speechSynthesis" in window
    && "SpeechSynthesisUtterance" in window;
}

export function speakEnglish(text: string): void {
  if (!canSpeak() || !text.trim()) return;

  const synthesis = window.speechSynthesis;
  synthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  const englishVoice = synthesis.getVoices().find((voice) => /^en(-|_)/i.test(voice.lang));
  if (englishVoice) utterance.voice = englishVoice;
  synthesis.speak(utterance);
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
