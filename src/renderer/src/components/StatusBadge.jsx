import React from 'react';

const STATE_LABELS = {
  idle: '😺 idle',
  typing: '⌨️ typing',
  swiping: '🐾 swiping',
  walking: '🚶 walking',
  eating: '🐟 eating',
  sitting: '🪑 sitting',
  sleeping: '😴 sleeping',
  running: '💨 running',
  scanning: '👀 scanning',
  sneaking: '🥷 sneaking',
};

export default function StatusBadge({ state, clickThrough }) {
  return (
    <>
      <div className={`status-badge ${state}`}>
        {STATE_LABELS[state] || `🐱 ${state}`}
      </div>
      {!clickThrough && (
        <div className="click-through-indicator visible">
          ⚡ drag mode (⌘⇧P)
        </div>
      )}
    </>
  );
}
