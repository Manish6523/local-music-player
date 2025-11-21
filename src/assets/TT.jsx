import React, { useState } from "react";

export default function TT() {
  const [result, setResult] = useState({});

  const handleSelect = (e) => {
    const files = Array.from(e.target.files);

    const tree = {};

    files.forEach((file) => {
      const path = file.webkitRelativePath; // e.g. "Play 01/music1.mp3"
      const parts = path.split("/");        // ["Play 01", "music1.mp3"]

      const folder = parts[parts.length - 2];
      const fileName = parts[parts.length - 1];

      if (!tree[folder]) tree[folder] = [];

      tree[folder].push({
        name: fileName,
        type: file.type,
        path: path,
      });
    });

    console.log("Folder Tree:", tree);
    setResult(tree);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Select Folder</h2>

      <input type="file" webkitdirectory="true" onChange={handleSelect} />

      <h3 style={{ marginTop: 20 }}>Output:</h3>
      <pre style={{ background: "#222", color: "#0f0", padding: 15 }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
