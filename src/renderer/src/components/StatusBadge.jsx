import React from 'react';

export default function StatusBadge({ state, clickThrough }) {
  return (
    <>
      <div className={`status-badge ${state}`}>
        {state === 'idle' && '😺 idle'}
        {state === 'typing' && '⌨️ typing'}
        {state === 'swiping' && '🐾 swiping'}
      </div>
      {!clickThrough && (
        <div className="click-through-indicator visible">
          ⚡ drag mode (⌘⇧P)
        </div>
      )}
    </>
  );
}
