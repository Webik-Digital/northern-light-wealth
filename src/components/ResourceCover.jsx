import React, { useState } from 'react';

// The face of a library card: the document's own first page where there is one,
// and a plain sheet where there is not.
//
// The fallback matters more than it looks like it should. Items added before
// covers existed have none, and a broken image or an empty gap would make the
// row look like a fault rather than a document waiting for its cover. A sheet
// with the title's initial reads as deliberate at a glance and keeps every card
// the same shape, so the grid does not jump around while covers are filled in.
export default function ResourceCover({ src, title }) {
  const [failed, setFailed] = useState(false);
  const initial = (title || '').trim().charAt(0).toUpperCase() || '·';

  if (!src || failed) {
    return (
      <span className="nlw-cover is-blank" aria-hidden="true">
        <span className="sheet"><span className="ltr">{initial}</span></span>
      </span>
    );
  }

  return (
    <span className="nlw-cover" aria-hidden="true">
      <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
    </span>
  );
}
