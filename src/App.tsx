import React, { useState, useEffect, useRef } from "react";
import { playBirthdaySong, stopMelody } from "./audio";
import { Share2, Check, Sparkles, Flame, RotateCcw } from "lucide-react";

interface ConfettiPiece {
  id: number;
  symbol: string;
  left: number;
  fontSize: number;
  duration: number;
  delay: number;
  rotation: number;
}

export default function App() {
  const [screen, setScreen] = useState<"name" | "birthday">("name");
  const [name, setName] = useState<string>("");
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [musicStatusText, setMusicStatusText] = useState<string>(
    "A little melody made just for this moment ✨"
  );
  const [confettiList, setConfettiList] = useState<ConfettiPiece[]>([]);
  const [candleLit, setCandleLit] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [wishMade, setWishMade] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Check URL parameters on mount (e.g. ?name=Alex or ?to=Alex)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryName = params.get("name") || params.get("to") || params.get("friend");
      if (queryName && queryName.trim()) {
        const decoded = queryName.trim();
        setName(decoded);
        setScreen("birthday");
        setTimeout(() => triggerConfetti(), 300);
      }
    } catch {
      // Ignore if URL parsing is unavailable
    }
  }, []);

  const triggerConfetti = () => {
    const symbols = ["✦", "✧", "•", "✨", "🎉", "💖", "🎂"];
    const newBatch: ConfettiPiece[] = [];
    const baseId = Date.now();

    for (let i = 0; i < 80; i++) {
      newBatch.push({
        id: baseId + i,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        left: Math.random() * 100,
        fontSize: Math.random() * 14 + 10,
        duration: Math.random() * 3 + 3,
        delay: Math.random() * 1.5,
        rotation: Math.random() * 360,
      });
    }

    setConfettiList((prev) => [...prev, ...newBatch]);

    // Automatically clean up old confetti after 6.5s
    setTimeout(() => {
      setConfettiList((prev) => prev.filter((p) => !newBatch.some((nb) => nb.id === p.id)));
    }, 6500);
  };

  const handleStartBirthday = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setIsShaking(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      setTimeout(() => {
        setIsShaking(false);
      }, 450);
      return;
    }

    setScreen("birthday");
    triggerConfetti();

    // Optionally update the browser URL search params so the link is shareable
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("name", trimmed);
      window.history.replaceState({}, "", url.toString());
    } catch {
      // Fallback safe
    }
  };

  const handleToggleMusic = async () => {
    if (isPlayingMusic) {
      stopMelody();
      setIsPlayingMusic(false);
      setMusicStatusText("Melody paused ✨ Click below to play again!");
      return;
    }

    setIsPlayingMusic(true);
    setMusicStatusText("🎵 Happy Birthday Melody is playing...");

    try {
      await playBirthdaySong(() => {
        setIsPlayingMusic(false);
        setMusicStatusText("A little melody made just for this moment ✨");
      });
    } catch {
      setIsPlayingMusic(false);
      setMusicStatusText("Unable to play audio. Tap to try again!");
    }
  };

  const handleBlowCandle = () => {
    setCandleLit((prev) => {
      const next = !prev;
      if (!next) {
        setWishMade(true);
        triggerConfetti();
        setTimeout(() => setWishMade(false), 4000);
      }
      return next;
    });
  };

  const handleCopyLink = () => {
    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("name", name.trim() || "Friend");
      navigator.clipboard.writeText(currentUrl.toString());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleReset = () => {
    stopMelody();
    setIsPlayingMusic(false);
    setScreen("name");
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("name");
      window.history.replaceState({}, "", url.toString());
    } catch {
      // Fallback
    }
  };

  return (
    <>
      {/* =========================
           NAME SCREEN
      ========================== */}
      <main
        id="nameScreen"
        className={`screen ${screen === "name" ? "active" : ""}`}
        style={{ display: screen === "name" ? "flex" : "none" }}
      >
        <div className="intro-card" id="introCard">
          <div className="top-sparkles" id="topSparkles">
            ✨ 🐱 ✨
          </div>

          <h1 id="introTitle">A Little Surprise</h1>

          <p className="subtitle" id="introSubtitle">
            Someone is celebrating today...
          </p>

          <div className="big-cat" id="introCat">
            🐱
          </div>

          <h2 id="questionPrompt">Who is the Birthday Star?</h2>

          <form onSubmit={handleStartBirthday}>
            <input
              ref={inputRef}
              type="text"
              id="nameInput"
              className={isShaking ? "shake" : ""}
              placeholder="Enter their name"
              maxLength={30}
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />

            <div>
              <button type="submit" id="enterButton">
                ENTER ✨
              </button>
            </div>
          </form>

          <p className="small-note" id="smallNote">
            Made with Python-inspired logic 🐍 &nbsp;•&nbsp; A little friendship surprise
          </p>
        </div>
      </main>

      {/* =========================
           BIRTHDAY SCREEN
      ========================== */}
      <main
        id="birthdayScreen"
        className={`screen ${screen === "birthday" ? "active" : ""}`}
        style={{ display: screen === "birthday" ? "flex" : "none" }}
      >
        {/* Decorative balloons */}
        <div className="balloon balloon-1">🎈</div>
        <div className="balloon balloon-2">🎈</div>
        <div className="balloon balloon-3">🎈</div>
        <div className="balloon balloon-4">🎈</div>

        {/* Floating sparkles */}
        <div className="sparkle sparkle-1">✦</div>
        <div className="sparkle sparkle-2">✧</div>
        <div className="sparkle sparkle-3">✦</div>
        <div className="sparkle sparkle-4">✧</div>

        <section className="birthday-card" id="birthdayCard">
          <div className="heading-decoration">🎉 ✨ 🎉</div>

          <h1 id="happyBirthdayHeading">HAPPY BIRTHDAY</h1>

          <h2 id="birthdayName">{name.trim() || "Friend"} ✨</h2>

          {/* CAT & CAKE CONTAINER */}
          <div className="cat-container" id="catScene">
            {/* Birthday Hat */}
            <div className="birthday-hat">
              <div className="hat-ball">●</div>
              <div className="hat-body"></div>
            </div>

            {/* Cat */}
            <div className="cat">
              <div className="ear left-ear"></div>
              <div className="ear right-ear"></div>

              <div className="cat-face">
                <div className="eye left-eye"></div>
                <div className="eye right-eye"></div>

                <div className="nose"></div>

                <div className="mouth left-mouth"></div>
                <div className="mouth right-mouth"></div>

                <div className="whisker w1"></div>
                <div className="whisker w2"></div>
                <div className="whisker w3"></div>
                <div className="whisker w4"></div>
              </div>

              <div className="cat-body"></div>
              <div className="cat-tail"></div>
            </div>

            {/* Cake */}
            <div className="cake" id="birthdayCake">
              {candleLit ? (
                <div
                  className="flame"
                  id="candleFlame"
                  title="Click to blow out the candle and make a wish!"
                  onClick={handleBlowCandle}
                ></div>
              ) : (
                <div
                  className="absolute"
                  style={{
                    bottom: 110,
                    left: 65,
                    fontSize: 14,
                    cursor: "pointer",
                    zIndex: 6,
                  }}
                  title="Candle is blown out! Tap to relight."
                  onClick={handleBlowCandle}
                >
                  💨
                </div>
              )}

              <div
                className="candle"
                title="Tap candle to blow out or relight"
                onClick={handleBlowCandle}
                style={{ cursor: "pointer" }}
              ></div>

              <div className="cream"></div>

              <div className="cake-body">
                <span>•</span>
                <span>•</span>
                <span>•</span>
                <span>•</span>
                <span>•</span>
              </div>

              <div className="plate"></div>
            </div>
          </div>

          {/* Wish Banner if candle blown */}
          {wishMade && (
            <div
              className="py-1 px-4 my-2 inline-block rounded-full text-xs font-semibold text-purple-700 bg-purple-100 animate-bounce"
              id="wishAlert"
            >
              🎂 Wish made! May all your dreams come true! ✨
            </div>
          )}

          {/* Candle hint */}
          <div className="text-xs text-purple-500/80 mb-3 -mt-1 select-none">
            {candleLit ? (
              <button
                type="button"
                onClick={handleBlowCandle}
                className="hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <Flame size={13} className="text-amber-500" /> Tap the flame to make a wish & blow it out!
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBlowCandle}
                className="hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer text-purple-600"
              >
                <Sparkles size={13} className="text-amber-500" /> Wish made! Tap candle to light it again ✨
              </button>
            )}
          </div>

          {/* MESSAGE */}
          <div className="message" id="birthdayMessage">
            <p>Another year, another chapter. 📚✨</p>
            <p>
              Keep learning, keep growing,
              <br />
              and keep chasing the things that make you happy! 🌸
            </p>
          </div>

          {/* MUSIC */}
          <div className="music-box" id="musicBox">
            <div className="music-title">🎵 Happy Birthday Melody</div>

            <button
              id="musicButton"
              type="button"
              onClick={handleToggleMusic}
              className="active:scale-95"
            >
              {isPlayingMusic ? "⏸ PAUSE MELODY" : "▶ PLAY MELODY"}
            </button>

            <div className="music-status" id="musicStatus">
              {musicStatusText}
            </div>
          </div>

          {/* FINAL MESSAGE */}
          <div className="final-message" id="finalMessageGroup">
            <span>🐱 Keep smiling.</span>
            <span>📚 Keep learning.</span>
            <span>✨ Keep being awesome.</span>
          </div>

          {/* FRIEND SHARING & INTERACTION TOOLBAR */}
          <div className="mt-6 pt-5 border-t border-purple-100 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              id="shareButton"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full border border-purple-200/70 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-emerald-600" /> Copied Birthday Link!
                </>
              ) : (
                <>
                  <Share2 size={14} /> Copy Link for Friend
                </>
              )}
            </button>

            <button
              type="button"
              id="confettiMoreButton"
              onClick={triggerConfetti}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-full border border-pink-200/70 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Sparkles size={14} /> More Confetti! 🎉
            </button>

            <button
              type="button"
              id="resetButton"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-full transition-all cursor-pointer"
              title="Change name or start over"
            >
              <RotateCcw size={13} /> Change Name
            </button>
          </div>
        </section>

        {/* CONFETTI */}
        <div id="confettiContainer">
          {confettiList.map((piece) => (
            <div
              key={piece.id}
              className="confetti"
              style={{
                left: `${piece.left}%`,
                fontSize: `${piece.fontSize}px`,
                animationDuration: `${piece.duration}s`,
                animationDelay: `${piece.delay}s`,
                transform: `rotate(${piece.rotation}deg)`,
              }}
            >
              {piece.symbol}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
