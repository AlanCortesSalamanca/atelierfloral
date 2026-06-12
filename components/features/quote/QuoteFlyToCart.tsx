"use client";

import { useEffect, useState } from "react";
import { quoteFlyAnimationEvent, quoteFlyTargetSelector, type QuoteFlyAnimationDetail } from "@/components/features/quote/quoteFlyAnimation";

type FlyItem = QuoteFlyAnimationDetail & {
  targetRect: DOMRectReadOnly;
  started: boolean;
};

const maxFlySize = 92;
const flyAnimationDurationMs = 1100;

function getFlySize(rect: DOMRectReadOnly) {
  return Math.max(48, Math.min(maxFlySize, Math.min(rect.width, rect.height)));
}

function cssImageUrl(url: string | null) {
  if (!url) return undefined;
  return `url("${url.replace(/"/g, "%22")}")`;
}

export function QuoteFlyToCart() {
  const [items, setItems] = useState<FlyItem[]>([]);

  useEffect(() => {
    const animationFrames: number[] = [];
    const timeouts: number[] = [];

    function onFly(event: Event) {
      const detail = (event as CustomEvent<QuoteFlyAnimationDetail>).detail;
      const target = document.querySelector(quoteFlyTargetSelector);
      if (!(target instanceof HTMLElement)) return;

      const item: FlyItem = {
        ...detail,
        targetRect: target.getBoundingClientRect(),
        started: false,
      };

      setItems((current) => [...current, item]);

      const firstFrame = window.requestAnimationFrame(() => {
        const secondFrame = window.requestAnimationFrame(() => {
          setItems((current) => current.map((currentItem) => (currentItem.id === item.id ? { ...currentItem, started: true } : currentItem)));
        });
        animationFrames.push(secondFrame);
      });
      animationFrames.push(firstFrame);

      const cleanupTimeout = window.setTimeout(() => {
        setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
      }, flyAnimationDurationMs + 120);
      timeouts.push(cleanupTimeout);
    }

    window.addEventListener(quoteFlyAnimationEvent, onFly);
    return () => {
      window.removeEventListener(quoteFlyAnimationEvent, onFly);
      animationFrames.forEach((frame) => window.cancelAnimationFrame(frame));
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {items.map((item) => {
        const size = getFlySize(item.sourceRect);
        const startX = item.sourceRect.left + item.sourceRect.width / 2 - size / 2;
        const startY = item.sourceRect.top + item.sourceRect.height / 2 - size / 2;
        const endSize = 18;
        const endX = item.targetRect.left + item.targetRect.width / 2 - endSize / 2;
        const endY = item.targetRect.top + item.targetRect.height / 2 - endSize / 2;

        return (
          <div
            key={item.id}
            className={`absolute rounded-2xl border border-white/80 bg-beige bg-cover bg-center shadow-soft transition-all ease-[cubic-bezier(0.22,1,0.36,1)] ${item.image ? "" : "image-soft"}`}
            style={{
              backgroundImage: cssImageUrl(item.image),
              height: item.started ? endSize : size,
              opacity: item.started ? 0.18 : 1,
              transitionDuration: `${flyAnimationDurationMs}ms`,
              transform: `translate3d(${item.started ? endX : startX}px, ${item.started ? endY : startY}px, 0) rotate(${item.started ? 8 : 0}deg)`,
              width: item.started ? endSize : size,
            }}
          />
        );
      })}
    </div>
  );
}
