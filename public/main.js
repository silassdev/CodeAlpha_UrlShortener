const form = document.getElementById('shortenForm');
const longUrlInput = document.getElementById('longUrl');
const result = document.getElementById('result');
const shortLink = document.getElementById('shortLink');
const copyBtn = document.getElementById('copyBtn');
const message = document.getElementById('message');

function showResult(url, note) {
  shortLink.href = url;
  shortLink.textContent = url;
  message.textContent = note || '';
  result.classList.remove('hidden');
}

function hideResult() {
  result.classList.add('hidden');
  shortLink.href = '#';
  shortLink.textContent = '';
  message.textContent = '';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideResult();
  const longUrl = longUrlInput.value.trim();
  if (!longUrl) return;

  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl: longUrl })
    });
    const data = await res.json().catch(() => null);

    if (res.ok && data && data.shortUrl) {
      showResult(data.shortUrl, 'Click to open; copy to clipboard if needed.');
    } else {
      // fallback demo short link
      const rand = Math.random().toString(36).slice(2,9);
      const fake = location.origin + '/' + rand;
      showResult(fake, '(demo) ' + (data && data.error ? data.error : 'API unavailable'));
    }
  } catch (err) {
    const rand = Math.random().toString(36).slice(2,9);
    const fake = location.origin + '/' + rand;
    showResult(fake, '(demo) network error');
    console.error('shorten error', err);
  }
});

copyBtn.addEventListener('click', () => {
  const url = shortLink.href;
  if (!url) return;
  navigator.clipboard?.writeText(url).then(() => {
    message.textContent = 'Copied to clipboard';
  }).catch(() => {
    message.textContent = 'Faid to copy';
  });
});
