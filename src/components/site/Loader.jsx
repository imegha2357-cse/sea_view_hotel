// First-visit loading screen (Taj-style): the hotel's logo gently pulsing on Ivory while the page
// loads, then a soft fade. Shown once per browser session. It never blocks for long: it is removed
// when the page has loaded (at least 0.9 s for a calm transition), and CSS hides it after 4 s
// even if scripts fail. With "reduce motion" the logo does not pulse.
const S = { w: 256, h: 171 };

export const loaderScript = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem('sv-boot')){d.classList.add('boot-done');return}d.classList.add('booting');var t0=Date.now();function done(){var w=Math.max(0,900-(Date.now()-t0));setTimeout(function(){d.classList.add('boot-done');d.classList.remove('booting');try{sessionStorage.setItem('sv-boot','1')}catch(e){}},w)}if(document.readyState==='complete')done();else window.addEventListener('load',done);setTimeout(done,3500)}catch(e){document.documentElement.classList.add('boot-done')}})();`;

export default function Loader() {
  return (
    <div className="boot" aria-hidden="true">
      <div className="boot-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="boot-s" src="/brand/s-mark.png" width={S.w} height={S.h} alt="" />
        <span className="boot-hotel" data-t="Hotel" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="boot-wm" src="/brand/wordmark-dark.png" width={1114} height={187} alt="" />
        <span className="boot-line" />
      </div>
    </div>
  );
}
