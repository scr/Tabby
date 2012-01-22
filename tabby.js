(function() {
    /**
     * Set this to true when debugging to see alerts at the various
     * callbacks.
     * @type {boolean}
     */
    var DEBUG = false;

    /**
     * Shorthand for chrome.tabs.
     * @type {Object}
     */
    var tabs = chrome.tabs;

    /**
     * Shorthand for chrome.windows.
     * @type {Object}
     */
    var windows = chrome.windows;

    /**
     * Mapping of windowId -> selectedTabId.
     * @type {Object.<integer, integer>}
     */
    var selectedTabs = {};

    /**
     * The window id of the focused window.
     * @type {integer}
     */
    var focusedWindow = windows.WINDOW_ID_NONE;

    /**
     * The currently pinned tabs to move around.
     * @type {Array.<Tab>}
     */
    var pinnedTabs = [];

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

    // TODO(scr) document
    windows.onFocusChanged.addListener(function(windowID) {
					   if (windowID === windows.WINDOW_ID_NONE)
					       return;
					   var moveFromWindowId = focusedWindow;
					   if (focusedWindow !== windows.WINDOW_ID_NONE) {
					       tabs.query({
							      pinned: true,
							      windowId: moveFromWindowId,
							  }, function(tabArray) {
							      pinnedTabs = tabArray;
							      if (DEBUG) {
								  alert('# pinned tabs from ' +
									moveFromWindowId +
									' = ' + pinnedTabs.length);
								  console.log(pinnedTabs.map(
										  function(tab) {
										      return tab.id;
										  }));
							      }
							      tabs.move(pinnedTabs.map(function(tab) {
											   return tab.id;
											   }),
									{
									    windowId: windowID,
									    index: 0,
									}, function(movedTabs) {
									    movedTabs.map(function(tab) {
											      tabs.update(tab.id, {
													      pinned: true,
													  });
											  });
									});
							  });
					   }
					   focusedWindow = windowID;
					   if (DEBUG)
					       alert('focusing ' + windowID);
				       });
    // TODO(scr) document
    windows.onRemoved.addListener(function(windowID) {
				      if (DEBUG) {
					  alert('removing ' + windowID +
						', focused=' + focusedWindow);
				      }
				  });

})();
