import React, {useEffect, useRef, useState} from 'react';
import styles from './DomainTyper.module.css';

type Domain = {emoji: string; title: string; desc: string; to?: string};

function sleep(ms: number) { return new Promise((res) => setTimeout(res, ms)); }

export default function DomainTyper({domains}: {domains: Domain[]}) {
  const slots = 3;
  const mounted = useRef(true);
  const [states, setStates] = useState(() => Array.from({length: slots}, () => ({emoji: '•', title: '', desc: '', isTyping: false})));

  useEffect(() => {
    mounted.current = true;

    async function runSlot(slotIndex: number) {
      while (mounted.current) {
        // pick domain attempting to be distinct from current titles
        const currentTitles = new Set(states.map(s => s.title).filter(Boolean));
        let domain = domains[Math.floor(Math.random() * domains.length)];
        for (let attempt = 0; attempt < 8; attempt++) {
          if (!currentTitles.has(domain.title)) break;
          domain = domains[Math.floor(Math.random() * domains.length)];
        }

        const fullTitle = domain.title;
        const fullDesc = domain.desc;

        setStates((s) => {
          const copy = [...s];
          copy[slotIndex] = {emoji: domain.emoji, title: '', desc: '', isTyping: true};
          return copy;
        });

        // type title
        for (let i = 1; i <= fullTitle.length && mounted.current; i++) {
          // eslint-disable-next-line no-loop-func
          setStates((s) => {
            const copy = [...s];
            copy[slotIndex] = { ...copy[slotIndex], title: fullTitle.slice(0, i) };
            return copy;
          });
          // speed
          // eslint-disable-next-line no-await-in-loop
          await sleep(36 + Math.random() * 48);
        }

        await sleep(280 + Math.random() * 300);

        // type desc
        for (let i = 1; i <= fullDesc.length && mounted.current; i++) {
          setStates((s) => {
            const copy = [...s];
            copy[slotIndex] = { ...copy[slotIndex], desc: fullDesc.slice(0, i) };
            return copy;
          });
          // eslint-disable-next-line no-await-in-loop
          await sleep(16 + Math.random() * 26);
        }

        // visible time
        await sleep(2000 + Math.random() * 1200);

        // clear
        setStates((s) => {
          const copy = [...s];
          copy[slotIndex] = { ...copy[slotIndex], isTyping: false };
          return copy;
        });
        await sleep(220);
        setStates((s) => {
          const copy = [...s];
          copy[slotIndex] = { emoji: '•', title: '', desc: '', isTyping: false };
          return copy;
        });
        await sleep(220 + Math.random() * 420);
      }
    }

    for (let i = 0; i < slots; i++) runSlot(i);

    return () => { mounted.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains]);

  return (
    <div className={styles.container}>
      {states.map((s, i) => (
        <div key={i} className={styles.slot}>
          <span className={styles.icon}>{s.emoji}</span>
          <div className={styles.title} aria-hidden>
            <span className={styles.typed}>{s.title}</span>
          </div>
          <div className={styles.desc} aria-hidden>
            <span className={styles.typed}>{s.desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
