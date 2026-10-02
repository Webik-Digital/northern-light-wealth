import React, { useState } from 'react';

// One award or publication in the recognition row.
//
// A logo if there is a file for it, and the name set in type if there is not.
// The name is the part that matters — the claim is that these bodies have
// recognised the firm, and a missing image should not quietly delete that from
// the page. An empty box says nothing; "The Globe and Mail" says the thing.
//
// onError catches the same failure at runtime: a file that 404s, or a host that
// answers with something that is not an image. That is exactly how the previous
// set broke, and it broke silently, so the fallback is worth the four lines.
export default function RecognitionMark({ name, src }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className={`nlw-logo${showImage ? '' : ' is-name'}`} title={name}>
      {showImage ? (
        <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="nlw-logo-name">{name}</span>
      )}
    </div>
  );
}
