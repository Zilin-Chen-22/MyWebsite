(() => {
  const target = document.querySelector('#cal-inline-chenzili22');
  if (!target) return;

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
        'cal-brand': '#404650', 'cal-brand-emphasis': '#222326', 'cal-brand-text': '#fafafa',
        'cal-text': '#222326', 'cal-text-emphasis': '#222326', 'cal-text-subtle': '#6f7178',
        'cal-bg': '#fafafa', 'cal-bg-subtle': '#f0f0f2', 'cal-bg-muted': '#f5f5f6',
        'cal-border': '#dedee2', 'cal-border-subtle': '#e7e7ea', 'cal-border-emphasis': '#404650',
        'radius': '2px', 'radius-md': '4px', 'radius-lg': '6px', 'radius-xl': '8px'
      },
      dark: {
        'cal-brand': '#b7bfcd', 'cal-brand-emphasis': '#d8dce4', 'cal-brand-text': '#111214',
        'cal-text': '#ededee', 'cal-text-emphasis': '#ffffff', 'cal-text-subtle': '#95969b',
        'cal-bg': '#111214', 'cal-bg-subtle': '#191a1d', 'cal-bg-muted': '#191a1d',
        'cal-border': '#3a3b40', 'cal-border-subtle': '#2b2c30', 'cal-border-emphasis': '#b7bfcd',
        'radius': '2px', 'radius-md': '4px', 'radius-lg': '6px', 'radius-xl': '8px'
      }
    }
  });

  window.Cal('init', { origin: 'https://cal.com' });
  window.Cal('inline', {
    elementOrSelector: '#cal-inline-chenzili22',
    calLink: 'chenzili22',
    config: { layout: 'month_view', theme: theme() }
  });
  window.Cal('ui', ui(theme()));

  window.addEventListener('zilin-theme-change', event => window.Cal('ui', ui(event.detail.theme)));
})();
