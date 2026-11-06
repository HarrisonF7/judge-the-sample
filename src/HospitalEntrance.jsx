import React, { useEffect, useRef, useState } from 'react';
import hallwayImage from './assets/hospital-hallway.jpg';
import doorwayImage from './assets/hospital-doorway.jpg';
import unlockedImage from './assets/hospital-unlocked.jpg';

export default function HospitalEntrance({ onEnter }) {
  const [entering, setEntering] = useState(false);
  const started = useRef(false);
  const entryTimer = useRef(null);
  const completed = useRef(false);
  const [artReady, setArtReady] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([hallwayImage, doorwayImage, unlockedImage].map(src => {
      const image = new Image();
      image.src = src;
      return image.decode();
    })).then(() => { if (active) setArtReady(true); }).catch(() => {});
    return () => { active = false; };
  }, []);

  function finishEntry() {
    if (completed.current) return;
    completed.current = true;
    window.clearTimeout(entryTimer.current);
    onEnter();
  }
  useEffect(() => () => window.clearTimeout(entryTimer.current), []);

  function enterHospital() {
    if (started.current) return;
    started.current = true;
    if (!artReady || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishEntry();
      return;
    }
    setEntering(true);
    // The blackout animation normally completes entry; this is a safety fallback.
    entryTimer.current = window.setTimeout(finishEntry, 3200);
  }

  return <main className={`hospital-entrance cinematic-entrance${entering ? ' is-entering' : ''}`} aria-labelledby="entrance-title" aria-busy={entering}>
    <header className="entrance-heading">
      <p className="hospital-kicker">HARRISON MEMORIAL</p>
      <h1 id="entrance-title">SOME RECORDS SURVIVED.</h1>
      <p>A HOSPITAL LEFT BEHIND. AN INVESTIGATION WAITING INSIDE.</p>
    </header>
    <div className="cinematic-scene">
      <div className="cinematic-camera">
        <img src={hallwayImage} width="1672" height="941" fetchPriority="high" decoding="async" alt="Original cinematic scene: Rick Grimes, viewed from behind in a pale hospital gown, explores a damaged hospital corridor. A wheelchair and stretcher stand beside chained doors painted DON'T OPEN, DEAD INSIDE." />
        <div className="doorway-stage" aria-hidden="true" style={{ backgroundImage: `url(${doorwayImage})` }}>
          {['left', 'right'].map((side, index) => <svg key={side} className={`cinematic-door cinematic-door-${side}`} viewBox={`${914 + index * 143} 277 143 284`} preserveAspectRatio="none">
            <defs><clipPath id={`hardware-${side}`}><rect x="1012" y="398" width="90" height="90" /></clipPath></defs>
            <image href={hallwayImage} width="1672" height="941" />
            <image href={unlockedImage} x="1012" y="398" width="90" height="90" />
            <image className="door-hardware" href={hallwayImage} width="1672" height="941" clipPath={`url(#hardware-${side})`} />
          </svg>)}
        </div>
      </div>
    </div>
    <div className="entrance-blackout" aria-hidden="true" onAnimationEnd={event => {
      if (event.target === event.currentTarget && event.animationName === 'hospital-blackout') finishEntry();
    }} />
    <div className="entrance-action">
      <p className="hospital-kicker">Judge the Sample · Clinic waiting times</p>
      <button type="button" className="enter-hospital" onClick={enterHospital} disabled={entering}>ENTER THE HOSPITAL <span aria-hidden="true">→</span></button>
      <p>Open the research terminal. All six assignment stages remain accessible.</p>
      <small>A visual homage to the abandoned hospital in The Walking Dead, Season 1. Unofficial student project.</small>
    </div>
  </main>;
}
