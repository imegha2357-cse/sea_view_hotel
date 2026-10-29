// The hotel's official logo from hotelseaview.in: the gold script "S" with "HOTEL SEA VIEW".
// The "SEA VIEW" wordmark is the hotel's own artwork (charcoal, or ivory on dark backgrounds),
// always shown at its natural proportions. `light` forces the ivory version; otherwise the header
// switches between them (ivory over the hero photo, charcoal once the header turns white).
const S = { src: '/brand/s-mark.png', w: 256, h: 171 };
const WM = { w: 1114, h: 187 };

export default function Brand({ light = false, stacked = false }) {
  return (
    <span className={`brand-mark logo ${light ? 'light' : ''} ${stacked ? 'stacked' : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="brand-s" src={S.src} width={S.w} height={S.h} alt="" />
      <span className="brand-words">
        <span className="brand-hotel" aria-hidden="true">
          Hotel
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="brand-wm wm-dark" src="/brand/wordmark-dark.png" width={WM.w} height={WM.h} alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="brand-wm wm-light" src="/brand/wordmark-light.png" width={WM.w} height={WM.h} alt="" />
        <span className="sr-only">Hotel Sea View</span>
      </span>
    </span>
  );
}
export { Brand };
