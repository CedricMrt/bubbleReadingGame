import { useEffect, useRef, useState } from "react";
import backgroundImg from "../assets/background.webp";

const GAME_DURATION = 30;

type Phase = "intro" | "running" | "finished";

interface BubbleData {
  id: string;
  number: number;
  left: number;
  top: number;
}

interface BubbleProps {
  left: number;
  top: number;
  number: number;
}

export default function BubbleReadingGame() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [timer, setTimer] = useState(GAME_DURATION);
  const [currentBubble, setCurrentBubble] = useState<BubbleData | null>(null);

  const timerRef = useRef<number | null>(null);
  const bubbleTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && phase === "intro") setPhase("running");
      if (e.code === "Space" && phase === "finished") {
        setTimer(GAME_DURATION);
        setCurrentBubble(null);
        setPhase("running");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  useEffect(() => {
    if (phase !== "running") return;

    timerRef.current = window.setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          if (timerRef.current !== null) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
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

  useEffect(() => {
    if (phase !== "running") return;

    const spawnBubble = () => {
      const bubble: BubbleData = {
        id: crypto.randomUUID(),
        number: Math.floor(Math.random() * 1000),
        left: Math.random() * 85 + 5,
        top: Math.random() * 70 + 5,
      };
      if (currentBubble?.number === bubble.number) {
        spawnBubble();
      } else {
        setCurrentBubble(bubble);
      }

      bubbleTimeoutRef.current = window.setTimeout(() => {
        setCurrentBubble(null);

        if (phase === "running") {
          spawnBubble();
        }
      }, 5000);
    };

    spawnBubble();

    return () => {
      if (bubbleTimeoutRef.current !== null) {
        clearTimeout(bubbleTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const progressPct = (timer / GAME_DURATION) * 100;

  return (
    <div className='game-root'>
      <img src={backgroundImg} alt='background' className='bg-img' />

      {phase === "intro" && (
        <div className='overlay intro'>
          <div className='sprite-climb' aria-hidden />
          <div className='panel'>
            <h1>Prêt ?</h1>
            <p>
              Appuie sur <strong>ESPACE</strong> pour commencer
            </p>
          </div>
        </div>
      )}

      {phase === "running" && (
        <>
          {currentBubble && (
            <Bubble
              left={currentBubble.left}
              top={currentBubble.top}
              number={currentBubble.number}
            />
          )}

          <div className='progress-bar'>
            <div className='progress' style={{ width: `${progressPct}%` }} />
          </div>
        </>
      )}

      {phase === "finished" && (
        <div className='overlay finished'>
          <div className='panel'>
            <h2>Temps écoulé !</h2>
            <p className='hint'>Appuie sur Espace pour rejouer</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Bubble({ left, top, number }: BubbleProps) {
  return (
    <div
      className='bubble-appear'
      style={{
        position: "absolute",
        left: `${left}%`,
        top: `${top}%`,
        width: 96,
        height: 96,
      }}
      role='img'
      aria-label={`Bulle ${number}`}
    >
      <svg
        viewBox='0 0 100 100'
        width='100%'
        height='100%'
        xmlns='http://www.w3.org/2000/svg'
      >
        <defs>
          <linearGradient id='g' x1='0' x2='1'>
            <stop offset='0%' stopColor='#ffffff' />
            <stop offset='100%' stopColor='#dbeafe' />
          </linearGradient>
        </defs>

        <circle
          cx='50'
          cy='45'
          r='36'
          fill='url(#g)'
          stroke='#93c5fd'
          strokeWidth='3'
        />

        <circle cx='30' cy='30' r='8' fill='#ffffff' opacity='0.6' />

        <text
          x='50'
          y='56'
          fontSize='32'
          fontWeight='700'
          textAnchor='middle'
          fill='#0f172a'
          dominantBaseline='auto'
        >
          {number}
        </text>
      </svg>
    </div>
  );
}
