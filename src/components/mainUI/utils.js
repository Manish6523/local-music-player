// --- FALLBACK COVER GENERATION UTILITIES ---
export const generateSvgCover = (text, baseColor = "333333") => {
  const titleChar = encodeURIComponent(text.charAt(0).toUpperCase());
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
        <rect width="150" height="150" rx="10" ry="10" fill="#${baseColor}"/>
        <text x="75" y="100" font-size="70" font-family="sans-serif" fill="#ffffff" text-anchor="middle">${titleChar}</text>
    </svg>`;
  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
};

export const MUSIC_NOTE_FALLBACK =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMWRiOTU0Ii8+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtc2l6ZT0iNDAiIGZvbnQtZmFtaWx5PSJhcmlhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+4vzwvdGV4dD48L3N2Zz4=";
export const PLAYLIST_FALLBACK_SM =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMTUwIDE1MCI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIHJ4PSIxMCIgcnk9IjEwIiBmaWxsPSIjMjIyMjIyIi8+PHRleHQgeD0iNzUlIiB5PSI4NSUiIGZvbnQtc2l6ZT0iMzUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIj5QTEFZTElTVDwvdGV4dD48L3N2Zz4=";
export const PLAYLIST_FALLBACK_LG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgMzAwIDMwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIHJ4PSIxNSIgcnk9IjE1IiBmaWxsPSIjMWRiOTU0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIj5QTEFZTElTVDwvdGV4dD48L3N2Zz4=";

