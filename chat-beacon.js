// JS for showing/hiding the chat iframe and updating the beacon #
// vanilla jQuery for minimal dependency because shared between apps

/*global $, jQuery*/
/*global chatBeaconBootstrap, haml*/
/*global userPusherChannel, haml*/

function exists(varRef) {
  'use strict';
  var retVal = ((typeof(varRef) !== 'undefined') && varRef);
  return retVal;
}

$(function() {
  'use strict';
  if (!exists(chatBeaconBootstrap)) {
    return;
  }

  var chatFrameLoaded = false;
  var chatFrameOpened = false;
  var unreadCount = 0;

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

////////
// Open dropdown
  function openChatFrame() {
    $(".js-chat-iframe-container").fadeIn(125, function() {
      chatFrameOpened = true;
      updateUnreadBadge();
    });

    if (!chatFrameLoaded) {
      $(".js-chat-iframe-container iframe").attr('src',chatBeaconBootstrap.streamAppURL)[0].onload = function() {
        chatFrameLoaded = true;
      };
    }
  }

  if (exists(chatBeaconBootstrap.streamAppUnreadURL)){
    $.getJSON(chatBeaconBootstrap.streamAppUnreadURL, function (result) {
      //response data are now in the result variable
      unreadCount = result.count;
      updateUnreadBadge();
    }).error(function(xhrObj) {
      xhrObj.silenceError = true;
    });
  } else if (exists(chatBeaconBootstrap.unreadReplies)) {
    unreadCount = chatBeaconBootstrap.unreadReplies.length;
    updateUnreadBadge();
  }

  ////////
  // listen to pusher for new replies
  var bindInterval = false;
  var bindAttempts = 0;
  function attemptBind() {
    bindAttempts += 1;
    try {
      userPusherChannel.bind("unread_questions_update", function(data) {
        try {
          unreadCount = data.object.items.length;
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
  $(".js-show-chat").click(function() {
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

    // close frame
    if (e.data === 'closeChatDropdown' && chatFrameOpened) {
      closeChatFrame();
      return;
    }

    // adjust height with message like changeHeight:123
    if (e.data.match(/^changeHeight/)) {
      $(".js-chat-iframe-container").animate({
        height: e.data.match(/[0-9]+/) + "px"
      },125);
    }

  }, false);
});