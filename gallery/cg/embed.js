// Embed mode for the CG coursework pages.
// Opening a page with ?embed shows only the canvas and its controls (no title, code or notes),
// for use inside the gallery. Without ?embed the page is unchanged.
//   &light  transparent page, so whatever the canvas leaves empty shows the gallery's white
//   &bare   no sliders or other controls
//   &follow the gallery passes the mouse along while it is outside this frame, and the piece acts as if
//           the mouse were at the nearest point of the canvas's edge
(function () {
    if (!/[?&]embed\b/.test(location.search)) return;
    var light = /[?&]light\b/.test(location.search);
    var bare = /[?&]bare\b/.test(location.search);
    var follow = /[?&]follow\b/.test(location.search);
    window.KW_FOLLOW = follow;

    if (follow) window.addEventListener('message', function (e) {
        if (e.origin !== location.origin || !e.data || !e.data.kwPointer) return;
        var canvas = document.getElementById('canvas1');
        if (!canvas) return;
        var r = canvas.getBoundingClientRect(), p = e.data.kwPointer;   // p: the mouse in this frame's own pixels
        var x = Math.min(Math.max(p[0], r.left), r.right - 1);
        var y = Math.min(Math.max(p[1], r.top), r.bottom - 1);
        canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true }));
    });
    // a press passed along too, for a frame that lets the mouse fall through to what is under it
    // (kwAt: where it landed, in this frame's own pixels)
    if (follow) window.addEventListener('message', function (e) {
        if (e.origin !== location.origin || !e.data || typeof e.data.kwPress !== 'boolean') return;
        var canvas = document.getElementById('canvas1'), at = e.data.kwAt || [0, 0];
        if (canvas) canvas.dispatchEvent(new MouseEvent(e.data.kwPress ? 'mousedown' : 'mouseup', { clientX: at[0], clientY: at[1], bubbles: true }));
    });
    var bg = light ? 'transparent' : '#000';

    document.documentElement.style.background = bg;

    window.addEventListener('load', function () {
        // run after the course library has built its own layout
        setTimeout(function () {
            var canvas = document.getElementById('canvas1');
            if (!canvas) return;

            var box = document.createElement('div');
            box.id = 'kw-embed';
            box.appendChild(canvas);

            // keep the page's own controls (sliders, color pickers) and the short labels above them
            var inputs = document.querySelectorAll('input');
            if (inputs.length && !bare) {
                var controls = document.createElement('div');
                controls.id = 'kw-controls';
                Array.prototype.forEach.call(inputs, function (input) {
                    var label = input.previousElementSibling;
                    while (label && label.tagName === 'BR') label = label.previousElementSibling;
                    var row = document.createElement('label');
                    if (label && label.tagName === 'P') row.appendChild(document.createTextNode(label.textContent.trim()));
                    row.appendChild(input);
                    controls.appendChild(row);
                });
                box.appendChild(controls);
            }

            Array.prototype.forEach.call(document.body.children, function (el) {
                if (el.tagName !== 'VIDEO' && el.tagName !== 'SCRIPT') el.style.display = 'none';
            });
            document.body.removeAttribute('bgcolor');
            document.body.insertBefore(box, document.body.firstChild);

            var style = document.createElement('style');
            style.textContent =
                'html, body { margin: 0; background: ' + bg + '; overflow: hidden; }' +
                '#kw-embed { display: flex; flex-direction: column; align-items: center; }' +
                '#kw-embed canvas { display: block; }' +
                '#kw-controls { display: flex; gap: 18px; padding: 10px 0 6px; font: 12px/1.2 "Helvetica Neue", Arial, sans-serif; color: #cfc8b4; letter-spacing: 0.04em; }' +
                '#kw-controls label { display: flex; align-items: center; gap: 8px; }' +
                '#kw-controls input[type=range] { width: 120px; accent-color: #cfc8b4; }' +
                '#kw-controls input[type=color] { width: 28px; height: 20px; padding: 0; border: 0; background: none; }';
            document.head.appendChild(style);
        }, 0);
    });
})();
