const pills = document.querySelectorAll('[data-filter]');
const skillCards = document.querySelectorAll('.skill-card');
const showMoreButtons = document.querySelectorAll('.show-more');

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
