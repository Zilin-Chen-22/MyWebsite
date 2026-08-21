const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

const savedTheme = localStorage.getItem('zilin-theme');
const preferredDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (savedTheme === 'dark' || (!savedTheme && preferredDark)) root.dataset.theme = 'dark';

themeButton?.addEventListener('click', () => {
  const dark = root.dataset.theme === 'dark';
  if (dark) delete root.dataset.theme;
  else root.dataset.theme = 'dark';
  localStorage.setItem('zilin-theme', dark ? 'light' : 'dark');
});

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navLinks.classList.toggle('is-open', !open);
});

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
  });
});

document.querySelector(`[data-nav="${document.body.dataset.page}"]`)?.classList.add('is-active');

const projectMediaPlacements = {
  'perching-uav': [{ after: 0, media: [0] }, { after: 1, media: [3] }, { after: 2, media: [2] }, { after: 3, media: [1, 4] }],
  'robotic-arm': [{ after: 1, media: [0] }, { after: 2, media: [1, 2] }],
  'dea-drone': [{ after: 2, media: [0, 1] }],
  'drone-racing': [{ after: 0, media: [0, 1] }, { after: 1, media: [2] }],
  'dual-arm': [{ after: 0, media: [0] }, { after: 1, media: [1, 2, 3] }],
  'intelligent-car': [{ after: 0, media: [0, 1] }, { after: 1, media: [2] }, { after: 2, media: [3, 4] }]
};

const projectSlug = window.location.pathname.split('/').pop()?.replace('.html', '');
const mediaSection = document.querySelector('.project-media');
const detailBody = document.querySelector('.detail-body');
const placements = projectMediaPlacements[projectSlug];

if (mediaSection && detailBody && placements) {
  const headings = [...detailBody.querySelectorAll('h3')];
  const mediaCards = [...mediaSection.querySelectorAll('.media-card')];

  placements.forEach(({ after, media }) => {
    const target = headings[after]?.nextElementSibling;
    if (!target) return;
    const cluster = document.createElement('div');
    cluster.className = 'inline-media-cluster';
    media.forEach((index) => mediaCards[index] && cluster.append(mediaCards[index]));
    target.after(cluster);
  });

  mediaSection.remove();
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
document.querySelectorAll('.current-year').forEach((element) => { element.textContent = new Date().getFullYear(); });
