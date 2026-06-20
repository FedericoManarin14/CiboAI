'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { ProdottoReview } from '@/components/ProdottoReview';
import type { ProdottoOFF } from '@/lib/off';
import type { TipoPasto } from '@/lib/supabase/types';

type Stato = 'scan' | 'cerco' | 'trovato' | 'nontrovato';

export function BarcodeClient({ data, pasto }: { data: string; pasto: TipoPasto }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [stato, setStato] = useState<Stato>('scan');
  const [prodotto, setProdotto] = useState<ProdottoOFF | null>(null);
  const [erroreCam, setErroreCam] = useState<string | null>(null);
  const [manuale, setManuale] = useState('');
  const [ultimoCodice, setUltimoCodice] = useState('');

  useEffect(() => {
    if (stato !== 'scan') return;
    let attivo = true;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result, _err, controls) => {
        controlsRef.current = controls;
        if (result && attivo) {
          controls.stop();
          lookup(result.getText());
        }
      })
      .then((controls) => {
        controlsRef.current = controls;
      })
      .catch(() => setErroreCam('Fotocamera non disponibile. Inserisci il codice a mano.'));

    return () => {
      attivo = false;
      controlsRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stato]);

  async function lookup(code: string) {
    setUltimoCodice(code);
    setStato('cerco');
    try {
      const res = await fetch(`/api/off/barcode?code=${encodeURIComponent(code)}`);
      if (!res.ok) {
        setStato('nontrovato');
        return;
      }
      const json = await res.json();
      setProdotto(json.prodotto);
      setStato('trovato');
    } catch {
      setStato('nontrovato');
    }
  }

  if (stato === 'trovato' && prodotto) {
    return (
      <ProdottoReview
        prodotto={prodotto}
        data={data}
        pasto={pasto}
        fonte="barcode"
        onIndietro={() => {
          setProdotto(null);
          setStato('scan');
        }}
      />
    );
  }

  if (stato === 'cerco') {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="mt-4 font-medium">Cerco il prodotto…</p>
        <p className="text-sm text-muted">Codice {ultimoCodice}</p>
      </div>
    );
  }

  if (stato === 'nontrovato') {
    return (
      <div className="card p-6 text-center space-y-4">
        <p className="text-4xl">🔍</p>
        <p className="font-medium">Prodotto non trovato su Open Food Facts.</p>
        <p className="text-sm text-muted">Codice {ultimoCodice}</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => setStato('scan')} className="btn-ghost">
            Scansiona di nuovo
          </button>
          <a href={`/aggiungi/manuale?pasto=${pasto}&data=${data}`} className="btn-primary">
            Inserisci manualmente
          </a>
        </div>
      </div>
    );
  }

  // stato 'scan'
  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        {erroreCam ? (
          <div className="grid aspect-square place-items-center p-6 text-center text-sm text-muted">
            {erroreCam}
          </div>
        ) : (
          <div className="relative">
            <video ref={videoRef} className="aspect-square w-full bg-black object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-brand/80" />
          </div>
        )}
      </div>
      <p className="text-center text-sm text-muted">Inquadra il codice a barre del prodotto.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manuale.trim()) lookup(manuale.trim());
        }}
        className="flex gap-2"
      >
        <input
          value={manuale}
          onChange={(e) => setManuale(e.target.value)}
          inputMode="numeric"
          placeholder="Inserisci il codice a mano"
          className="input flex-1"
        />
        <button type="submit" className="btn-ghost">
          Cerca
        </button>
      </form>
    </div>
  );
}
