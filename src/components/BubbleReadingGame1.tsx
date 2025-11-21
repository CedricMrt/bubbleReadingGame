import { useEffect, useRef, useState } from "react";

const GAME_DURATION = 300;

type Phase = "intro" | "running" | "finished";

interface BubbleData {
  id: string;
  number: number;
  left: number;
  top: number;
}

export default function BubbleReadingGame() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [timer, setTimer] = useState(GAME_DURATION);

  // Une seule bulle
  const [currentBubble, setCurrentBubble] = useState<BubbleData | null>(null);

  const timerRef = useRef<number | null>(null);
  const bubbleTimeoutRef = useRef<number | null>(null);

  // -------------------------------------------
  // 1) Gestion de l'espace (intro → running)
  // -------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && phase === "intro") setPhase("running");
      if (e.code === "Space" && phase === "finished") {
        setTimer(GAME_DURATION);
        setCurrentBubble(null);
        setPhase("intro");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // -------------------------------------------
  // 2) Timer principal (30 secondes)
  // -------------------------------------------
  useEffect(() => {
    if (phase !== "running") return;

    timerRef.current = window.setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setPhase("finished");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase]);

  // -------------------------------------------
  // 3) Spawn d'une seule bulle, toutes les 5 sec
  // -------------------------------------------
  useEffect(() => {
    if (phase !== "running") return;

    const spawnBubble = () => {
      const bubble: BubbleData = {
        id: crypto.randomUUID(),
        number: Math.floor(Math.random() * 1000),
        left: Math.random() * 85 + 5,
        top: Math.random() * 70 + 5,
      };

      setCurrentBubble(bubble);

      // Supprimer la bulle après 5 sec puis en générer une nouvelle
      bubbleTimeoutRef.current = window.setTimeout(() => {
        setCurrentBubble(null);

        if (phase === "running") {
          spawnBubble(); // nouvelle bulle
        }
      }, 5000);
    };

    spawnBubble();

    return () => {
      if (bubbleTimeoutRef.current !== null) {
        clearTimeout(bubbleTimeoutRef.current);
      }
    };
  }, [phase]);

  const progressPct = (timer / GAME_DURATION) * 100;

  return (
    <div className='game-root'>
      {/* INTRO */}
      {phase === "intro" && (
        <div className='overlay intro'>
          <div className='sprite-climb' />
          <div className='panel'>
            <h1>Prêt ?</h1>
            <p>
              Appuie sur <strong>ESPACE</strong> pour commencer
            </p>
          </div>
        </div>
      )}

      {/* JEU */}
      {phase === "running" && (
        <>
          <div className='sprite-walk' />

          {/* UNE SEULE BULLE */}
          {currentBubble && (
            <Bubble
              left={currentBubble.left}
              top={currentBubble.top}
              number={currentBubble.number}
            />
          )}

          <div
            className='progress-bar'
            style={{
              position: "absolute",
              bottom: 10,
              left: 0,
              height: "20px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className='progress'
              style={{
                background: "red",
                height: "100%",
                width: `${progressPct}%`,
                borderRadius: "10px",
              }}
            />
          </div>
        </>
      )}

      {/* FIN */}
      {phase === "finished" && (
        <div className='overlay finished'>
          <div className='result-card'>
            <h2>Temps écoulé !</h2>
            <p className='hint'>Appuie sur Espace pour rejouer</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Bubble({ left, top, number }: Omit<BubbleData, "id">) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${left}%`,
        top: `${top}%`,
        width: 100,
        height: 100,
      }}
    >
      <svg viewBox='0 0 100 100' width='100%' height='100%'>
        <circle
          cx='50'
          cy='50'
          r='40'
          fill='#fff8'
          stroke='#66aaff'
          strokeWidth='3'
        />
        <text
          x='50'
          y='58'
          textAnchor='middle'
          fontSize='28'
          fontWeight='700'
          fill='#0f172a'
        >
          {number}
        </text>
      </svg>
    </div>
  );
}
