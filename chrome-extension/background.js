chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "getBookmarks") {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      if (sender.tab && sender.tab.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "bookmarksData",
          bookmarks: bookmarkTreeNodes
        });
      }
    });
  }
});