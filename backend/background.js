document.getElementById('open-google-photo').addEventListener('click', () => {
  chrome.tabs.create({ url: "https://photos.google.com/" });
});