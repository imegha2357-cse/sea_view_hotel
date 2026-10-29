// First-visit loading screen (Taj-style): the hotel's logo gently pulsing on Ivory while the page
// loads, then a soft fade. Shown once per browser session. It never blocks for long: it is removed
// when the page has loaded (at least 0.9 s for a calm transition), and CSS hides it after 4 s
// even if scripts fail. With "reduce motion" the logo does not pulse.
const S = { w: 256, h: 171 };

// Uses a data attribute (not the class list, which React manages) so hydration never resets it.
export const loaderScript = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem('sv-boot')){d.setAttribute('data-boot','done');return}d.setAttribute('data-boot','on');var t0=Date.now(),fired=0;function done(){if(fired)return;fired=1;var w=Math.max(0,900-(Date.now()-t0));setTimeout(function(){d.setAttribute('data-boot','done');try{sessionStorage.setItem('sv-boot','1')}catch(e){}},w)}if(document.readyState==='complete')done();else window.addEventListener('load',done);setTimeout(done,3500)}catch(e){d.setAttribute('data-boot','done')}})();`;

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
