const highlightTimers = new WeakMap();

const highlightTarget = (element) => {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  element.classList.add('is-highlighted');

  if (highlightTimers.has(element)) {
    window.clearTimeout(highlightTimers.get(element));
  }

  const timeoutId = window.setTimeout(() => {
    element.classList.remove('is-highlighted');
    highlightTimers.delete(element);
  }, 2000);

  highlightTimers.set(element, timeoutId);
};

const scrollToTarget = (target) => {
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (typeof target.scrollIntoView === 'function') {
    try {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    } catch (error) {
      try {
        target.scrollIntoView(true);
        return;
      } catch (innerError) {
        // fall through to manual scroll below
      }
    }
  }

  try {
    const rect = target.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + rect.top,
      behavior: 'smooth',
    });
  } catch (error) {
    window.scrollTo(0, target.offsetTop);
  }
};

const focusTarget = (target) => {
  if (!(target instanceof HTMLElement) || typeof target.focus !== 'function') {
    return;
  }

  try {
    target.focus({ preventScroll: true });
  } catch (error) {
    try {
      target.focus();
    } catch (innerError) {
      // ignore focus failures entirely
    }
  }
};

const init = () => {
  const pills = document.querySelectorAll('[data-filter]');
  const skillCards = document.querySelectorAll('.skill-card');
  const showMoreButtons = document.querySelectorAll('.show-more');
  const scrollLinks = document.querySelectorAll('[data-scroll-target]');
  const yearElement = document.getElementById('year');

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const filter = pill.dataset.filter;

      pills.forEach((btn) => btn.classList.remove('active'));
      pill.classList.add('active');

      skillCards.forEach((card) => {
        const tags = card.dataset.tags.split(' ');
        const show = filter === 'all' || tags.includes(filter);
        card.style.display = show ? 'block' : 'none';
      });
    });
  });

  showMoreButtons.forEach((button) => {
    const container = button.previousElementSibling;
    if (!container) {
      button.hidden = true;
      return;
    }

    const lists = Array.from(container.querySelectorAll('.responsibilities'));
    const headings = new Map();
    const items = [];

    lists.forEach((list) => {
      const heading =
        list.previousElementSibling &&
        list.previousElementSibling.classList.contains('responsibility-heading')
          ? list.previousElementSibling
          : null;

      if (heading && !headings.has(heading)) {
        headings.set(heading, []);
      }

      Array.from(list.querySelectorAll('[data-responsibility]')).forEach((item) => {
        items.push({ element: item, heading });
        if (heading) {
          headings.get(heading).push(item);
        }
      });
    });

    if (items.length <= 3) {
      button.hidden = true;
      return;
    }

    const collapse = () => {
      items.forEach((entry, index) => {
        if (index >= 3) {
          entry.element.classList.add('is-hidden');
        } else {
          entry.element.classList.remove('is-hidden');
        }
      });

      headings.forEach((elements, heading) => {
        const shouldHide = elements.every((item) => item.classList.contains('is-hidden'));
        heading.classList.toggle('is-hidden', shouldHide);
      });

      button.textContent = 'Show more';
      button.setAttribute('aria-expanded', 'false');
    };

    const expand = () => {
      items.forEach((entry) => entry.element.classList.remove('is-hidden'));
      headings.forEach((_, heading) => heading.classList.remove('is-hidden'));
      button.textContent = 'Show less';
      button.setAttribute('aria-expanded', 'true');
    };

    collapse();

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        collapse();
      } else {
        expand();
      }
    });
  });

  scrollLinks.forEach((link) => {
    const targetSelector = link.dataset.scrollTarget || link.getAttribute('href');
    if (!targetSelector || !targetSelector.startsWith('#')) {
      return;
    }

    const target = document.querySelector(targetSelector);
    if (!target) {
      return;
    }

    link.addEventListener('click', (event) => {
      event.preventDefault();

      scrollToTarget(target);
      focusTarget(target);

      window.requestAnimationFrame(() => highlightTarget(target));

      try {
        if (typeof history.replaceState === 'function') {
          history.replaceState(null, '', targetSelector);
        } else {
          window.location.hash = targetSelector;
        }
      } catch (error) {
        // Ignore history failures
      }
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
