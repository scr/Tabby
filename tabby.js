(function() {
    /**
     * Shorthand for chrome.tabs.
     * @type {Object}
     */
    var tabs = chrome.tabs;

    /**
     * Mapping of windowId -> selectedTabId.
     * @type {Object.<integer, integer>}
     */
    var selectedTabs = {};

    // populate |selectedTabs| for current state across all windows.
    chrome.windows.getAll(null, function(windows) {
	    var i;
	    for(i = 0; i < windows.length; ++i) {
		tabs.getSelected(windows[i].id, function(selectedTab) {
			selectedTabs[selectedTab.windowId] = selectedTab.id;
		    });
	    }
	});

    // Maintain |selectedTabs| so that new tab can be moved to the
    // right.
    tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
	    selectedTabs[selectInfo.windowId] = tabId;
	});

    // Force new tab creation to insert to the right of the selected
    // tab.
    tabs.onCreated.addListener(function(createdTab) {
	    var selectedTabId = selectedTabs[createdTab.windowId];
	    if (selectedTabId) {
		tabs.get(selectedTabId, function(selectedTab) {
			if (selectedTab) {
			    tabs.move(createdTab.id, {
				    index: selectedTab.index + 1,
					});
			}
		    });
	    }
	});
})()
