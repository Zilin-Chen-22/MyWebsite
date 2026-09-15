(() => {
  const booker = document.querySelector('#cal-booker');
  const optionButtons = [...document.querySelectorAll('[data-cal-option]')];
  if (!booker || !optionButtons.length) return;

  (function (windowObject, scriptUrl, initCommand) {
    const queue = (api, args) => api.q.push(args);
    const documentObject = windowObject.document;
    windowObject.Cal = windowObject.Cal || function () {
      const cal = windowObject.Cal;
      const args = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        const script = documentObject.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        documentObject.head.appendChild(script);
        cal.loaded = true;
      }
      if (args[0] === initCommand) {
        const api = function () { queue(api, arguments); };
        const namespace = args[1];
        api.q = api.q || [];
        if (typeof namespace === 'string') {
          cal.ns[namespace] = cal.ns[namespace] || api;
          queue(cal.ns[namespace], args);
          queue(cal, ['initNamespace', namespace]);
        } else queue(cal, args);
        return;
      }
      queue(cal, args);
    };
  })(window, 'https://app.cal.com/embed/embed.js', 'init');

  const theme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const ui = selectedTheme => ({
    theme: selectedTheme,
    layout: 'month_view',
    cssVarsPerTheme: {
      light: {
        'cal-brand': '#1e654e', 'cal-brand-emphasis': '#104532', 'cal-brand-text': '#fffdf7',
        'cal-text': '#173b31', 'cal-text-emphasis': '#104532', 'cal-text-subtle': '#687a71',
        'cal-bg': '#fffdf7', 'cal-bg-subtle': '#f1eddf', 'cal-bg-muted': '#f9f6ed',
        'cal-border': '#d7d5c9', 'cal-border-subtle': '#e5e0d2', 'cal-border-emphasis': '#1e654e',
        'radius': '2px', 'radius-md': '4px', 'radius-lg': '6px', 'radius-xl': '8px'
      },
      dark: {
        'cal-brand': '#71b79b', 'cal-brand-emphasis': '#92cbb4', 'cal-brand-text': '#0f1b17',
        'cal-text': '#eef5ed', 'cal-text-emphasis': '#ffffff', 'cal-text-subtle': '#a8b8af',
        'cal-bg': '#1c3029', 'cal-bg-subtle': '#244137', 'cal-bg-muted': '#172721',
        'cal-border': '#405b51', 'cal-border-subtle': '#314b42', 'cal-border-emphasis': '#71b79b',
        'radius': '2px', 'radius-md': '4px', 'radius-lg': '6px', 'radius-xl': '8px'
      }
    }
  });

  const options = {
    meeting15: { calLink: 'chenzili22/15min', label: '15-minute meeting' },
    meeting30: { calLink: 'chenzili22/30min', label: '30-minute meeting' },
    meetingFlexible: { calLink: 'chenzili22/15min-%E5%A4%8D%E5%88%B6', label: 'Flexible-duration meeting' }
  };
  const initialized = new Set();

  function initialize(optionName) {
    if (initialized.has(optionName)) return;
    const option = options[optionName];
    const panel = document.createElement('div');
    panel.className = 'cal-inline';
    panel.id = `cal-inline-${optionName}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-label', option.label);
    panel.hidden = true;
    booker.append(panel);

    window.Cal('init', optionName, { origin: 'https://cal.com' });
    window.Cal.ns[optionName]('inline', {
      elementOrSelector: `#${panel.id}`,
      calLink: option.calLink,
      config: { layout: 'month_view', theme: theme() }
    });
    window.Cal.ns[optionName]('ui', ui(theme()));
    initialized.add(optionName);
  }

  function activate(optionName) {
    if (!options[optionName]) return;
    initialize(optionName);
    optionButtons.forEach(button => button.setAttribute('aria-selected', String(button.dataset.calOption === optionName)));
    booker.querySelectorAll('.cal-inline').forEach(panel => { panel.hidden = panel.id !== `cal-inline-${optionName}`; });
  }

  optionButtons.forEach(button => button.addEventListener('click', () => activate(button.dataset.calOption)));
  activate('meeting15');

  window.addEventListener('zilin-theme-change', event => {
    initialized.forEach(optionName => window.Cal.ns[optionName]('ui', ui(event.detail.theme)));
  });
})();
