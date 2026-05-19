import {useState, useEffect, useRef} from "react";

const TypewriterEffect = ({text, speed = 30, onComplete}) => {
  const [displayedText, setDisplayedText] = useState("");
  const textRef = useRef("");
  const indexRef = useRef(0);
  const [isTyping, setIsTyping] = useState(false);

  // Sync textRef with incoming text
  useEffect(() => {
    // Jika teks direset atau sangat berbeda, mulai dari awal
    if (
      text.length < textRef.current.length ||
      !text.startsWith(textRef.current)
    ) {
      setDisplayedText("");
      indexRef.current = 0;
    }
    textRef.current = text;

    // Mulai animasi jika ada teks baru untuk diketik
    if (indexRef.current < textRef.current.length) {
      setIsTyping(true);
    }
  }, [text]);

  useEffect(() => {
    if (!isTyping) return;

    const typeNextChar = () => {
      if (indexRef.current < textRef.current.length) {
        const lag = textRef.current.length - indexRef.current;

        // Ambil karakter berikutnya
        // Jika tertinggal sangat jauh (>100 char), ambil 2 karakter sekaligus agar tidak terlalu lama
        const charsToTake = lag > 100 ? 2 : 1;
        const nextChars = textRef.current.substring(
          indexRef.current,
          indexRef.current + charsToTake,
        );

        setDisplayedText((prev) => prev + nextChars);
        indexRef.current += charsToTake;

        // Tentukan kecepatan detak berikutnya
        // Jika tertinggal jauh, percepat intervalnya
        const nextSpeed = lag > 50 ? speed / 4 : lag > 20 ? speed / 2 : speed;

        timeoutRef.current = setTimeout(typeNextChar, nextSpeed);
      } else {
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    };

    const timeoutRef = {current: setTimeout(typeNextChar, speed)};

    return () => clearTimeout(timeoutRef.current);
  }, [isTyping, speed, onComplete]);

  return (
    <div className="relative inline-block w-full">
      <span className="opacity-100 transition-opacity duration-300">
        {displayedText}
      </span>
      {displayedText.length < text.length && (
        <span className="inline-block w-[2px] h-[14px] ml-1 bg-brand-accent animate-pulse align-middle shadow-[0_0_8px_rgba(181,204,106,0.8)]"></span>
      )}
    </div>
  );
};

export default TypewriterEffect;
