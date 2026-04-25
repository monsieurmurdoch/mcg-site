(function() {
  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');

  if (nav && toggle) {
    const setOpen = isOpen => {
      nav.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    };

    toggle.addEventListener('click', () => {
      setOpen(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', event => {
      if (event.target instanceof HTMLAnchorElement) {
        setOpen(false);
      }
    });

    window.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    });
  }

  const scrollToHash = () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;

    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: 'start' });
      });
    }
  };

  window.addEventListener('load', scrollToHash);
  window.addEventListener('hashchange', scrollToHash);
  scrollToHash();

  const form = document.querySelector('[data-contact-form]');
  const status = document.querySelector('[data-form-status]');

  if (!form || !status) {
    return;
  }

  const buildMailto = fields => {
    const subject = encodeURIComponent(`Malka website inquiry: ${fields.topic || fields.requestType}`);
    const body = encodeURIComponent([
      `Name: ${fields.name}`,
      `Email: ${fields.email}`,
      `Phone: ${fields.phone || 'Not provided'}`,
      `Request type: ${fields.requestType}`,
      `Topic: ${fields.topic}`,
      '',
      fields.message
    ].join('\n'));

    return `mailto:info@malkacomm.com?subject=${subject}&body=${body}`;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const fields = Object.fromEntries(new FormData(form).entries());

    if (fields.companyWebsite) {
      return;
    }

    status.textContent = 'Sending...';
    submitButton.disabled = true;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fields)
      });

      if (!response.ok) {
        throw new Error('Email endpoint unavailable');
      }

      form.reset();
      status.textContent = 'Thanks. Your message was sent to info@malkacomm.com.';
    } catch (error) {
      window.location.href = buildMailto(fields);
      status.textContent = 'Your email app is opening with the message ready to send.';
    } finally {
      submitButton.disabled = false;
    }
  });
})();
