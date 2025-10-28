const btn_select = document.getElementById('btn-select')
const btn_stop = document.getElementById('btn-stop')


document.getElementById('open-google-photo').addEventListener('click', () => {
  window.open('https://photos.google.com/', '_blank');
});

btn_stop.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['public/content.js']
    }, () => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'stop-select' }, response => {
        if (chrome.runtime.lastError) {
          console.error("Message failed:", chrome.runtime.lastError.message);
        } else {
          console.log("Sended", response);
        }
      });
    });
  });
})

btn_select.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['public/content.js']
    }, () => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'start-select' }, response => {
        if (chrome.runtime.lastError) {
          console.error("Message failed:", chrome.runtime.lastError.message);
        } else {
          console.log("Sended", response);
        }
      });
    });
  });
});