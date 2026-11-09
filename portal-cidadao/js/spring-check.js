/**
 * SpringCheck (Vanilla JS / Web implementation)
 * Based on React Bits SpringCheck component
 * Handles spring animation, tactile swell, tick path offset, and strike-through.
 */
(function (global) {
  'use strict';

  var RULE_END = 0.84;
  var SWELL = 0.35;
  var TICK_PATH = 'M5 14L8.5 17.5L19 6.5';
  var ORIGIN = { left: 'left center', center: 'center', right: 'right center', none: 'left center' };

  function clamp01(val) {
    return Math.min(1, Math.max(0, val));
  }

  function zetaOf(bounce) {
    if (bounce <= 0) return 1;
    return -Math.log(bounce) / Math.sqrt(Math.PI * Math.PI + Math.log(bounce) * Math.log(bounce));
  }

  function readings(t, doneOpacity, strikeLag) {
    var held = clamp01(t);
    return {
      fill: 'scale(' + Math.max(t, 0) + ')',
      box: 'scale(' + (1 + SWELL * Math.max(0, t - 1)) + ')',
      tick: 1 - held,
      word: 1 - (1 - doneOpacity) * held,
      rule: 'scaleX(' + clamp01((held - strikeLag) / (RULE_END - strikeLag)) + ')'
    };
  }

  function SpringCheckInstance(el, options) {
    var self = this;
    this.el = el;
    this.options = Object.assign({
      bounce: 0.2,
      strikeLag: 0.12,
      doneOpacity: 0.42,
      strike: 'left',
      onChange: null
    }, options || {});

    // Read initial state
    var checkedAttr = el.getAttribute('aria-checked');
    this.on = checkedAttr === 'true' || el.classList.contains('is-checked');
    this.t = this.on ? 1 : 0;
    this.velocity = 0;
    this.rafId = null;

    // Elements
    this.box = el.querySelector('.spring-check__box');
    this.fill = el.querySelector('.spring-check__fill');
    this.tick = el.querySelector('.spring-check__tick path');
    this.word = el.querySelector('.spring-check__word');
    this.rule = el.querySelector('.spring-check__rule');

    // Ensure tick has required SVG properties
    if (this.tick) {
      this.tick.setAttribute('pathLength', '1');
      this.tick.style.strokeDasharray = '1';
    }

    this.write(this.t);

    // Event listeners
    var viaPointer = false;
    var reduce = (window.PC && window.PC.reduceMotion) ? window.PC.reduceMotion() : window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || el.disabled) return;
      viaPointer = true;
      if (!reduce) el.dataset.pressed = '';
    });

    var upHandler = function () {
      delete el.dataset.pressed;
    };
    var cancelHandler = function () {
      viaPointer = false;
      upHandler();
    };

    el.addEventListener('pointerup', upHandler);
    el.addEventListener('pointercancel', cancelHandler);
    el.addEventListener('pointerleave', cancelHandler);

    el.addEventListener('click', function (e) {
      if (el.disabled) return;
      viaPointer = false;
      self.toggle();
    });

    // Keyboard support (Space and Enter toggle checkbox)
    el.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        self.toggle();
      }
    });
  }

  SpringCheckInstance.prototype.write = function (val) {
    var r = readings(val, this.options.doneOpacity, this.options.strikeLag);
    if (this.fill) this.fill.style.transform = r.fill;
    if (this.box) this.box.style.transform = r.box;
    if (this.tick) this.tick.style.strokeDashoffset = r.tick;
    if (this.word) this.word.style.opacity = r.word;
    if (this.rule) this.rule.style.transform = r.rule;
  };

  SpringCheckInstance.prototype.setChecked = function (targetState, animate) {
    var self = this;
    this.on = !!targetState;
    this.el.setAttribute('aria-checked', this.on ? 'true' : 'false');
    this.el.classList.toggle('is-checked', this.on);

    var targetT = this.on ? 1 : 0;
    var reduce = (window.PC && window.PC.reduceMotion) ? window.PC.reduceMotion() : window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || animate === false) {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.t = targetT;
      this.write(this.t);
      return;
    }

    // Damped spring simulation
    if (this.rafId) cancelAnimationFrame(this.rafId);
    var zeta = zetaOf(this.options.bounce);
    var k = 320; // stiffness
    var d = 2 * Math.sqrt(k) * zeta; // damping
    var dt = 1 / 60;

    function step() {
      var force = -k * (self.t - targetT) - d * self.velocity;
      self.velocity += force * dt;
      self.t += self.velocity * dt;

      self.write(self.t);

      // Check if settled
      if (Math.abs(self.t - targetT) < 0.005 && Math.abs(self.velocity) < 0.01) {
        self.t = targetT;
        self.velocity = 0;
        self.write(self.t);
        self.rafId = null;
      } else {
        self.rafId = requestAnimationFrame(step);
      }
    }

    this.rafId = requestAnimationFrame(step);
  };

  SpringCheckInstance.prototype.toggle = function () {
    this.setChecked(!this.on);
    if (typeof this.options.onChange === 'function') {
      this.options.onChange(this.on);
    }
    // Dispatch standard change event for container integration
    var event = new CustomEvent('spring-change', {
      bubbles: true,
      detail: { checked: this.on }
    });
    this.el.dispatchEvent(event);
  };

  // Helper factory
  function createSpringCheck(options) {
    var opts = Object.assign({
      label: 'Ship the build',
      checked: false,
      color: 'var(--ink, #1b2430)',
      fillColor: 'var(--blue, #0b4ea2)',
      checkColor: '#ffffff',
      boxSize: 26,
      boxRadius: 8,
      fontSize: 16,
      bounce: 0.2,
      strikeLag: 0.12,
      doneOpacity: 0.42,
      strike: 'left',
      ariaLabel: '',
      className: ''
    }, options || {});

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.role = 'checkbox';
    btn.setAttribute('aria-checked', opts.checked ? 'true' : 'false');
    if (opts.ariaLabel) btn.setAttribute('aria-label', opts.ariaLabel);
    btn.className = 'spring-check' + (opts.className ? ' ' + opts.className : '');

    var ring = opts.boxSize >= 24 ? 2 : 1.5;
    var gap = Math.min(16, Math.max(8, Math.round(opts.boxSize * 0.43)));
    var ruleHeight = Math.max(1.5, Math.round(opts.fontSize / 6) / 2);

    btn.style.setProperty('--sc-ink', opts.color);
    btn.style.setProperty('--sc-fill', opts.fillColor);
    btn.style.setProperty('--sc-check', opts.checkColor);
    btn.style.setProperty('--sc-box', opts.boxSize + 'px');
    btn.style.setProperty('--sc-radius', opts.boxRadius + 'px');
    btn.style.setProperty('--sc-font', opts.fontSize + 'px');
    btn.style.setProperty('--sc-ring', ring + 'px');
    btn.style.setProperty('--sc-gap', gap + 'px');
    btn.style.setProperty('--sc-row', Math.max(44, opts.boxSize + 16) + 'px');
    btn.style.setProperty('--sc-rule', ruleHeight + 'px');
    btn.style.setProperty('--sc-origin', ORIGIN[opts.strike] || ORIGIN.left);

    var press = document.createElement('span');
    press.className = 'spring-check__press';

    var box = document.createElement('span');
    box.className = 'spring-check__box';

    var ringEl = document.createElement('span');
    ringEl.className = 'spring-check__ring';
    ringEl.setAttribute('aria-hidden', 'true');

    var fillEl = document.createElement('span');
    fillEl.className = 'spring-check__fill';

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'spring-check__tick');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', TICK_PATH);
    path.setAttribute('pathLength', '1');
    path.style.strokeDasharray = '1';
    path.style.strokeDashoffset = opts.checked ? '0' : '1';
    svg.appendChild(path);

    box.appendChild(ringEl);
    box.appendChild(fillEl);
    box.appendChild(svg);
    press.appendChild(box);

    var labelEl = document.createElement('span');
    labelEl.className = 'spring-check__label';

    var wordEl = document.createElement('span');
    wordEl.className = 'spring-check__word';
    wordEl.textContent = opts.label;

    labelEl.appendChild(wordEl);

    if (opts.strike !== 'none') {
      var ruleEl = document.createElement('span');
      ruleEl.className = 'spring-check__rule';
      ruleEl.setAttribute('aria-hidden', 'true');
      labelEl.appendChild(ruleEl);
    }

    btn.appendChild(press);
    btn.appendChild(labelEl);

    var instance = new SpringCheckInstance(btn, opts);
    btn._springCheck = instance;
    return btn;
  }

  // Auto-init existing DOM buttons
  function initAll(scope) {
    var root = scope || document;
    var elements = root.querySelectorAll('.spring-check:not([data-sc-ready])');
    elements.forEach(function (el) {
      el.setAttribute('data-sc-ready', 'true');
      el._springCheck = new SpringCheckInstance(el);
    });
  }

  global.SpringCheck = {
    create: createSpringCheck,
    init: initAll,
    Instance: SpringCheckInstance
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }
})(window);
