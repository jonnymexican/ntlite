import * as React from 'react';
import { downloadBackup, parseBackup, applyBackup } from '../backup.js';

export default function Vault() {
  const fileRef = React.useRef(null);
  const [status, setStatus] = React.useState(null);

  const restore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = parseBackup(await file.text());
      const count = applyBackup(data);
      setStatus(count > 0 ? `✅ Restored ${count} section${count === 1 ? '' : 's'}.` : 'Nothing to restore in that file.');
    } catch (err) {
      setStatus(`⚠️ ${err.message}`);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="vault-row">
      <button type="button" className="btn-secondary" onClick={downloadBackup}>
        ⬇️ Export data
      </button>
      <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>
        ⬆️ Import backup
      </button>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={restore} aria-label="Backup file" />
      {status && <span className="vault-status" role="status">{status}</span>}
    </div>
  );
}
