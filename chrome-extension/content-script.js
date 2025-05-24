// Facilita mensajes entre la web y la extensión
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data && event.data.action === "isMawhaExtensionInstalled") {
    window.postMessage({ action: "mawhaExtensionDetected" }, "*");
  }
  if (event.data && event.data.action === "getBookmarks") {
    chrome.runtime.sendMessage({ action: "getBookmarks" });
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "bookmarksData") {
    window.postMessage({ action: "bookmarksData", bookmarks: msg.bookmarks }, "*");
  }
});