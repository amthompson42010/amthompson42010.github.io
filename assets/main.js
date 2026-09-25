  // Copy email
  document.getElementById('copy').addEventListener('click', function () {
    var text = document.getElementById('email').textContent;
    var status = document.getElementById('copy-status');
    function selectIt() {
      var r = document.createRange(); r.selectNodeContents(document.getElementById('email'));
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      status.textContent = 'Selected. Press Ctrl+C or ⌘C to copy.';
    }
    try {
      navigator.clipboard.writeText(text).then(function () { status.textContent = 'Copied to clipboard.'; }, selectIt);
    } catch (e) { selectIt(); }
  });

  // Bathymetric contour field in the hero
  (function () {
    var c = document.getElementById('bathy'); if (!c) return;
    var ctx = c.getContext('2d');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var W, H, dpr;
    var basins = [
      { x: .78, y: .45, s: 1.0 },
      { x: .95, y: .9, s: .7 },
      { x: .55, y: .05, s: .55 }
    ];
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = c.clientWidth; H = c.clientHeight;
      c.width = W * dpr; c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var base = Math.max(W, H);
      basins.forEach(function (b, bi) {
        var cx = b.x * W, cy = b.y * H;
        for (var k = 1; k <= 14; k++) {
          var r0 = k * base * 0.028 * b.s;
          ctx.beginPath();
          for (var i = 0; i <= 120; i++) {
            var a = i / 120 * Math.PI * 2;
            var wob = Math.sin(a * 3 + t * .25 + k * .4 + bi) * .09
                    + Math.sin(a * 5 - t * .18 + k * .7) * .05
                    + Math.cos(a * 2 + t * .1 + bi * 2) * .07;
            var r = r0 * (1 + wob);
            var x = cx + Math.cos(a) * r * 1.35, y = cy + Math.sin(a) * r;
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          var major = k % 5 === 0;
          ctx.strokeStyle = major ? 'rgba(241,180,76,.55)' : 'rgba(79,194,192,' + (0.5 - k * 0.022) + ')';
          ctx.lineWidth = major ? 1.2 : .8;
          ctx.stroke();
        }
      });
      // sonar sweep ping
      var p = (t * .12) % 1;
      ctx.beginPath();
      ctx.arc(basins[0].x * W, basins[0].y * H, p * base * .45, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(241,180,76,' + (0.35 * (1 - p)) + ')';
      ctx.lineWidth = 1.5; ctx.stroke();
    }
    resize();
    window.addEventListener('resize', function () { resize(); if (reduce) draw(0); });
    if (reduce) { draw(0); return; }
    var start = performance.now();
    (function loop(now) { draw((now - start) / 1000); requestAnimationFrame(loop); })(start);
  })();
