const pills = document.querySelectorAll('[data-filter]');
const skillCards = document.querySelectorAll('.skill-card');
const showMoreButtons = document.querySelectorAll('.show-more');
const scrollLinks = document.querySelectorAll('[data-scroll-target]');
const highlightTimers = new WeakMap();

const highlightTarget = (element) => {
  if (!(element instanceof HTMLElement)) {
    return false;
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
  return true;
};

const smoothScrollTo = (target) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (typeof target.scrollIntoView === 'function') {
    try {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    } catch (error) {
      try {
        target.scrollIntoView(true);
        return true;
      } catch (innerError) {
        // ignore and fall back to manual scrolling
      }
    }
  }

  try {
    window.scrollTo({
      top: target.offsetTop,
      behavior: 'smooth',
    });
    return true;
  } catch (error) {
    try {
      window.scrollTo(0, target.offsetTop);
      return true;
    } catch (innerError) {
      return false;
    }
  }
};

const focusTarget = (target) => {
  if (!(target instanceof HTMLElement) || typeof target.focus !== 'function') {
    return false;
  }

  try {
    target.focus({ preventScroll: true });
    return true;
  } catch (error) {
    try {
      target.focus();
      return true;
    } catch (innerError) {
      return false;
    }
  }
};

const updateHash = (selector) => {
  if (typeof selector !== 'string' || !selector.startsWith('#')) {
    return false;
  }

  try {
    if (typeof history.replaceState === 'function') {
      history.replaceState(null, '', selector);
      return true;
    }

    window.location.hash = selector;
    return true;
  } catch (error) {
    return false;
  }
};

document.getElementById('year').textContent = new Date().getFullYear();

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
  const selector = link.dataset.scrollTarget || link.getAttribute('href');
  if (!selector || !selector.startsWith('#')) {
    return;
  }

  const target = document.querySelector(selector);
  if (!target) {
    return;
  }

  link.addEventListener('click', (event) => {
    const didScroll = smoothScrollTo(target);

    if (!didScroll) {
      return;
    }

    event.preventDefault();

    window.requestAnimationFrame(() => {
      focusTarget(target);
      highlightTarget(target);
    });

    updateHash(selector);
  });
});
