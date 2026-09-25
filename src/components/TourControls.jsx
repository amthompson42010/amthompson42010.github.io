import { useEffect, useRef, useState } from "react";

const TOUR_INTERVAL_MS = 5000;

export default function TourControls({ buildings, onSelect }) {
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  function goToIndex(i) {
    const b = buildings[i];
    if (!b) return;
    onSelect(b.id);
  }

  useEffect(() => {
    if (!playing) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % buildings.length;
        goToIndex(next);
        return next;
      });
    }, TOUR_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, buildings]);

  function start() {
    if (buildings.length === 0) return;
    setPlaying(true);
    goToIndex(index);
  }

  function stop() {
    setPlaying(false);
  }

  function next() {
    if (buildings.length === 0) return;
    const n = (index + 1) % buildings.length;
    setIndex(n);
    goToIndex(n);
  }

  function prev() {
    if (buildings.length === 0) return;
    const p = (index - 1 + buildings.length) % buildings.length;
    setIndex(p);
    goToIndex(p);
  }

  return (
    <div className="panel tour-controls">
      <button onClick={prev} title="Previous building" aria-label="Previous building">
        ⏮
      </button>
      {!playing ? (
        <button onClick={start} title="Start tour">
          ▶ Tour
        </button>
      ) : (
        <button onClick={stop} title="Stop tour">
          ⏸ Stop
        </button>
      )}
      <button onClick={next} title="Next building" aria-label="Next building">
        ⏭
      </button>
    </div>
  );
}
