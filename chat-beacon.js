// JS for showing/hiding the chat iframe and updating the beacon #
// vanilla jQuery for minimal dependency because shared between apps

/*global $, jQuery*/
/*global chatBeaconBootstrap, window*/
/*global userPusherChannel, haml*/

function exists(varRef) {
  'use strict';
  var retVal = ((typeof(varRef) !== 'undefined') && varRef);
  return retVal;
}

$(document).ready(function() {
  'use strict';
  if (!exists(window.chatBeaconBootstrap)) {
    return;
  }

  var chatFrameLoaded = false;
  var chatFrameOpened = false;
  var unreadCount = 0;
  var chatFrameURL = window.chatBeaconBootstrap.streamAppURL + '?skipRedirect=1';
  var chatFramePopupWindow;
  var chatFramePopupWindowOpts = {width: 800, height: 640};
  chatFramePopupWindowOpts.left = (screen.width / 2) - (chatFramePopupWindowOpts.width / 2);
  chatFramePopupWindowOpts.top = (screen.height / 2) - (chatFramePopupWindowOpts.height / 2);

  ////////
  // Update counter badge in DOM
  function updateUnreadBadge() {
    if (unreadCount > 0) {
      $(".js-chat-count").html(unreadCount).show();
    } else {
      $(".js-chat-count").hide();
    }
  }

  ////////
  // Close dropdown
  function closeChatFrame() {
    $(".js-chat-iframe-container").fadeOut(125, function() {
      chatFrameOpened = false;
    });
  }

  function popupChatFrame(payload) {
    chatFramePopupWindow = window.open(
      payload.currentUrl+"?popup=1",
      'Chat',
      'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + chatFramePopupWindowOpts.width + ', height=' + chatFramePopupWindowOpts.height + ', top=' + chatFramePopupWindowOpts.top + ', left=' + chatFramePopupWindowOpts.left);
  }

  function preloadChatFrame() {
    $(".js-chat-iframe-container iframe").attr('src', chatFrameURL);
    chatFrameLoaded = true;
  }

  preloadChatFrame();

////////
// Open dropdown
  function openChatFrame() {
    $(".js-chat-iframe-container").fadeIn(125, function() {
      chatFrameOpened = true;
      updateUnreadBadge();
    });

    if (!chatFrameLoaded) {
      $(".js-chat-iframe-container iframe").attr('src', chatFrameURL)[0].onload = function() {
        chatFrameLoaded = true;
      };
    }
  }

  if (exists(window.chatBeaconBootstrap.streamAppUnreadURL)){
    $.getJSON(chatBeaconBootstrap.streamAppUnreadURL, function (result) {
      //response data are now in the result variable
      unreadCount = result.total_count;
      updateUnreadBadge();
    }).error(function(xhrObj) {
        xhrObj.silenceError = true;
      });
  } else if (exists(window.chatBeaconBootstrap.unreadReplies)) {
    unreadCount = window.chatBeaconBootstrap.unreadReplies.length;
    updateUnreadBadge();
  }

  ////////
  // listen to pusher for new replies
  var bindInterval = false;
  var bindAttempts = 0;
  function attemptBind() {
    bindAttempts += 1;
    try {
      window.userPusherChannel.bind("unread_questions_update", function(data) {
        try {
          unreadCount = data.object.total_count;
          updateUnreadBadge();
        } catch(e) { }
      });
      clearInterval(bindInterval);
    } catch(e) {
      if (bindAttempts > 20) {
        // not going to bind...
        clearInterval(bindInterval);
      }
    }
  }
  // keep trying to bind while pusher sets up
  bindInterval = setInterval(attemptBind, 250);

  ////////
  // click handler on chat bubble
  $(".js-show-chat").click(function(e) {
    e.preventDefault();
    if (chatFrameOpened) {
      closeChatFrame();
    } else {
      openChatFrame();
    }
  });

  ////////
  // listen to window messages to adjust frame
  window.addEventListener("message", function(e) {
    if (!e.data) {
      return;
    }

    if (typeof e.data.totalUnreadMessages !== 'undefined') {
      unreadCount = e.data.totalUnreadMessages;
      updateUnreadBadge();
      return;
    }

    // close frame
    if (e.data === 'closeChatDropdown' && chatFrameOpened) {
      closeChatFrame();
      return;
    }

    // popup frame
    if (e.data.event && e.data.payload && e.data.event === "popupChatWindow" && chatFrameOpened) {
      popupChatFrame(e.data.payload);
      return;
    }

    // adjust height with message like changeHeight:123
    if (typeof e.data.match === 'function' && e.data.match(/^changeHeight/)) {
      $(".js-chat-iframe-container").animate({
        height: e.data.match(/[0-9]+/) + "px"
      },125);
    }

  }, false);
});
