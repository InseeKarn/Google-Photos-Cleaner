// ==== CONFIG & Helper ====
const CONFIG = {
    maxCount: 10000,
    selectors: {
      counter: ".rtExYb",
      checkbox: ".ckGgle[aria-checked=false]",
      photoDiv: ".yDSiEe.uGCjIb.zcLWac.eejsDc.TWmIyd",
      deleteButton: 'button[aria-label="Move to trash"]'
    },
    timeout: 600000,
    scrollDelay: 300
};

const wait = ms => new Promise(r => setTimeout(r, ms));
const waitUntil = async (condition, timeout = CONFIG.timeout) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const result = await condition();
        if (result) return result;
        await wait(CONFIG.scrollDelay);
    }
    throw new Error("Timeout reached");
};
const getElement = selector => document.querySelector(selector);
const getElements = selector => [...document.querySelectorAll(selector)];
const getCount = () => {
    const counterElement = getElement(CONFIG.selectors.counter);
    return counterElement ? parseInt(counterElement.textContent, 10) || 0 : 0;
};
const scrollPhotoListBy = async height => {
    const photoDiv = getElement(CONFIG.selectors.photoDiv);
    const initialTop = photoDiv.scrollTop;
    photoDiv.scrollBy(0, height);
    await wait(500);
    return photoDiv.scrollTop > initialTop;
};

// ==== Select & Delete Photos ====
const selectPhotos = async () => {
    const checkboxes = await waitUntil(() => {
        const elements = getElements(CONFIG.selectors.checkbox);
        return elements.length > 0 ? elements : null;
    });
    const currentCount = getCount();
    const targetCheckboxes = checkboxes.slice(0, CONFIG.maxCount - currentCount);
    targetCheckboxes.forEach(checkbox => checkbox.click());
    await wait(200);
    return { newCount: getCount(), lastCheckbox: targetCheckboxes[targetCheckboxes.length - 1] };
};

const deleteSelected = async () => {
    const count = getCount();
    if (count <= 0) return;
    console.log(`Deleting ${count} photos`);
    getElement(CONFIG.selectors.deleteButton).click();
    const confirmationButton = await waitUntil(() => 
        [...document.querySelectorAll("button")].find(btn => btn.textContent.trim() === "Move to trash")
    );
    confirmationButton.click();
    await waitUntil(() => getCount() === 0);
};

let shouldStop = false;

async function deleteGooglePhotos() {
    try {
        while (true) {
            const { newCount, lastCheckbox } = await selectPhotos();
            if (!lastCheckbox) break;
            const { top } = lastCheckbox.getBoundingClientRect();
            await scrollPhotoListBy(top);

            if (shouldStop) break;
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (!shouldStop) {
            await deleteSelected();
            console.log("Finished deleting photos");
        } else {
            console.log("Stoped by User");
        }

    }
}



console.log("content.js loaded");
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'start-select') {
    if (shouldStop == false) {
        deleteGooglePhotos();
    }
    sendResponse({ status: 'started' });
  }
  if (msg.action === 'stop-select') {
    shouldStop = true;
    sendResponse({ status: 'stopping' });
  }
  return true;
});
