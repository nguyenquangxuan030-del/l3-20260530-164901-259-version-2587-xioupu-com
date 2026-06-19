
(function(){
  const ready = (fn) => document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);
  const q = (sel, root=document) => root.querySelector(sel);
  const qa = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function initMenu(){
    const btn = q('[data-menu-toggle]');
    const nav = q('[data-site-nav]');
    if(!btn || !nav) return;
    btn.addEventListener('click', ()=> nav.classList.toggle('open'));
    document.addEventListener('click', (e)=>{
      if(!nav.contains(e.target) && !btn.contains(e.target)) nav.classList.remove('open');
    });
  }

  function initSearch(){
    qa('[data-search-input]').forEach(input => {
      const zone = input.closest('main') || document;
      const cards = qa('.search-zone [data-search]', zone);
      const focusBtn = q('[data-search-focus]', zone);
      const emptyBox = q('.search-empty', zone);
      function apply(){
        const term = input.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach(card => {
          const txt = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          const hit = !term || txt.includes(term);
          card.classList.toggle('hidden-card', !hit);
          if(hit) visible++;
        });
        if(emptyBox) emptyBox.style.display = visible ? 'none' : 'block';
      }
      input.addEventListener('input', apply);
      input.addEventListener('keydown', e => { if(e.key === 'Enter') apply(); });
      if(focusBtn) focusBtn.addEventListener('click', ()=> { input.focus(); apply(); });
      apply();
    });
  }

  function initHero(){
    const hero = q('[data-hero]');
    if(!hero) return;
    const slides = qa('[data-hero-slide]', hero);
    const dotsWrap = q('[data-hero-dots]', hero);
    if(!slides.length) return;
    let index = 0;
    const dots = slides.map((_, i)=>{
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero-dot' + (i===0 ? ' active' : '');
      dot.addEventListener('click', ()=> show(i));
      dotsWrap && dotsWrap.appendChild(dot);
      return dot;
    });
    function show(i){
      index = (i + slides.length) % slides.length;
      slides.forEach((s, idx)=> s.classList.toggle('active', idx===index));
      dots.forEach((d, idx)=> d.classList.toggle('active', idx===index));
    }
    setInterval(()=> show(index+1), 5200);
  }

  function initPlayer(){
    qa('[data-player]').forEach(wrapper => {
      const video = q('video', wrapper);
      const btn = q('[data-player-play]', wrapper);
      const src = wrapper.getAttribute('data-m3u8');
      let loaded = false;
      let hls = null;
      function loadStream(){
        if(loaded) return;
        loaded = true;
        if(window.Hls && Hls.isSupported()){
          hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        }else{
          video.src = src;
        }
      }
      async function play(){
        loadStream();
        wrapper.classList.add('playing');
        try { await video.play(); } catch(e) {}
      }
      if(btn) btn.addEventListener('click', play);
      video.addEventListener('click', play);
      video.addEventListener('play', ()=> wrapper.classList.add('playing'));
      video.addEventListener('pause', ()=> { if(video.currentTime < 0.5) wrapper.classList.remove('playing'); });
    });
  }

  ready(()=>{ initMenu(); initSearch(); initHero(); initPlayer(); });
})();
