// popup.js
(() => {
  const pageUrlEl = document.getElementById('pageUrl');
  const imagesEl = document.getElementById('images');
  const endpointInput = document.getElementById('endpoint');
  const saveEndpointBtn = document.getElementById('saveEndpoint');
  const refreshBtn = document.getElementById('refresh');
  const verifyBtn = document.getElementById('verify');
  const statusEl = document.getElementById('status');

  let imagesList = []; // array of {url}
  let selectedImage = null;

  // Load saved endpoint
  chrome.storage.local.get(['iv_endpoint'], (res) => {
    if (res.iv_endpoint) endpointInput.value = res.iv_endpoint;
  });

  saveEndpointBtn.addEventListener('click', () => {
    const val = endpointInput.value.trim();
    chrome.storage.local.set({ iv_endpoint: val }, () => {
      status(`Saved endpoint: ${val || '(empty)'}`);
    });
  });

  refreshBtn.addEventListener('click', () => {
    status('Refreshing images...');
    collectImagesFromActiveTab();
  });

  verifyBtn.addEventListener('click', async () => {
    const endpoint = endpointInput.value.trim();
    if (!endpoint) {
      status('Please set an API endpoint and save it first.');
      return;
    }
    if (!selectedImage) {
      status('Please select an image.');
      return;
    }
    verifyBtn.disabled = true;
    try {
      status('Fetching image...');
      // fetch the image as blob
      const resp = await fetch(selectedImage);
      if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`);
      const blob = await resp.blob();

      // prepare form data
      const form = new FormData();
      // generate filename from URL
      const filename = selectedImage.split('/').pop().split('?')[0] || 'image';
      form.append('file', blob, filename);
      // attach metadata
      form.append('image_url', selectedImage);
      form.append('page_url', pageUrlEl.dataset.pageUrl || '');

      status('Sending to endpoint...');
      const sendResp = await fetch(endpoint, {
        method: 'POST',
        body: form
      });

      const contentType = sendResp.headers.get('content-type') || '';
      let bodyText;
      if (contentType.includes('application/json')) {
        bodyText = JSON.stringify(await sendResp.json(), null, 2);
      } else {
        bodyText = await sendResp.text();
      }

      status(`Response (${sendResp.status}):\n${bodyText}`);
    } catch (err) {
      status(`Error: ${err.message}`);
    } finally {
      verifyBtn.disabled = false;
    }
  });

  function status(text) {
    statusEl.textContent = text;
  }

  function renderImages(list) {
    imagesEl.innerHTML = '';
    if (!list.length) {
      imagesEl.textContent = 'No images found on this page.';
      verifyBtn.disabled = true;
      return;
    }
    list.forEach((url, idx) => {
      const item = document.createElement('div');
      item.className = 'img-item';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'selImage';
      radio.id = `img-${idx}`;
      radio.style.marginRight = '8px';
      radio.addEventListener('change', () => {
        selectedImage = url;
        verifyBtn.disabled = false;
      });

      const thumb = document.createElement('img');
      thumb.className = 'thumb';
      // show a tiny placeholder until image loads
      thumb.src = url;
      thumb.alt = url;
      thumb.onerror = () => { thumb.src = ''; thumb.style.background = '#eee'; thumb.style.display = 'block'; };

      const meta = document.createElement('div');
      meta.className = 'img-meta';
      meta.textContent = url;

      item.appendChild(radio);
      item.appendChild(thumb);
      item.appendChild(meta);
      imagesEl.appendChild(item);
    });

    // pre-select first
    const firstRadio = imagesEl.querySelector('input[type=radio]');
    if (firstRadio) {
      firstRadio.checked = true;
      selectedImage = list[0];
      verifyBtn.disabled = false;
    }
  }

  // execute a function in the active tab to collect images and page url
  function collectImagesFromActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab) {
        status('No active tab.');
        return;
      }
      pageUrlEl.textContent = `Page: ${tab.url || '(unknown)'}`;
      pageUrlEl.dataset.pageUrl = tab.url || '';

      // the function to run inside the page
      const gatherFn = () => {
        // collect from <img> tags, srcset, background-image, <a> hrefs
        const results = new Set();

        // helper to normalize
        const norm = (u) => {
          try { return new URL(u, document.baseURI).href; }
          catch { return null; }
        };

        // <img> tags
        document.querySelectorAll('img').forEach(img => {
          if (img.src) {
            const n = norm(img.src); if (n) results.add(n);
          }
          // srcset: pick first candidate (could be multiple sizes)
          if (img.srcset) {
            const srcset = img.srcset.split(',').map(s => s.trim().split(' ')[0]).filter(Boolean);
            if (srcset.length) {
              const n = norm(srcset[0]); if (n) results.add(n);
            }
          }
        });

        // background-image
        document.querySelectorAll('*').forEach(el => {
          const st = window.getComputedStyle(el).getPropertyValue('background-image') || '';
          // looks like url("..."), may contain multiple
          const urlRegex = /url\((?:'|")?(.*?)(?:'|")?\)/g;
          let m;
          while ((m = urlRegex.exec(st)) !== null) {
            const n = norm(m[1]); if (n) results.add(n);
          }
        });

        // links that point to images
        document.querySelectorAll('a').forEach(a => {
          if (a.href) {
            const low = a.href.toLowerCase();
            if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/.test(low)) {
              const n = norm(a.href); if (n) results.add(n);
            }
          }
        });

        // Also look for <source> in <picture> etc.
        document.querySelectorAll('source').forEach(s => {
          if (s.srcset) {
            const srcset = s.srcset.split(',').map(p => p.trim().split(' ')[0]).filter(Boolean);
            if (srcset.length) {
              const n = norm(srcset[0]); if (n) results.add(n);
            }
          }
          if (s.src) {
            const n = norm(s.src); if (n) results.add(n);
          }
        });

        return Array.from(results);
      }; // end gatherFn

      // inject + run
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: gatherFn
        },
        (injectionResults) => {
          if (chrome.runtime.lastError) {
            status('Error injecting script: ' + chrome.runtime.lastError.message);
            imagesEl.textContent = 'Error collecting images.';
            return;
          }
          try {
            const res = injectionResults[0] && injectionResults[0].result ? injectionResults[0].result : [];
            imagesList = Array.isArray(res) ? res : [];
            renderImages(imagesList);
            status(`Found ${imagesList.length} image(s).`);
          } catch (err) {
            status('Error reading results: ' + err.message);
          }
        }
      );
    });
  }

  // initial collection on load
  collectImagesFromActiveTab();
})();
