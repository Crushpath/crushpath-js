// JS for showing/hiding the chat iframe and updating the beacon #
// vanilla jQuery

$(function() {
  var chatFrameLoaded = false;
  var chatFrameOpened = false;
  var unreadCount = 0;

  ////////
  // set up initial beacon value from bootstrap
  unreadCount = chatBeaconBootstrap.unreadReplies;
  updateUnreadBadge();

  ////////
  // listen to pusher for new rpelies
  try {
    Pusher.bind("new_reply", function() {
      if (!chatFrameOpened) {
        unreadCount++;
        updateUnreadBadge();
      }
    });
  } catch(e) {
    // unable to bind to Pusher!
    // catch so we do not blow up page for broken badge...
  }

  ////////
  // click handler on chat bubble
  $(".js-show-chat").click(chatFrameOpened ? closeChatFrame : openChatFrame);

  ////////
  // listen to window message to close chat frame
  window.addEventListener("message", function(e) {
    if (e.data === 'closeChatDropdown') {
      closeChatFrame();
    }
  }, false);

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
      unreadCount = 0;      // set "new" to 0 when tool opened
      updateUnreadBadge();
    });

    if (!chatFrameLoaded) {
      $(".js-chat-iframe-container iframe").attr('src',chatBeaconBootstrap.streamAppURL)[0].onload = function() {
        chatFrameLoaded = true;
      };
    }
  }

  ////////
  // Update counter badge in DOM
  function updateUnreadBadge() {
    if (unreadCount > 0) {
      $(".js-chat-count").html(unreadCount).show();
    } else {
      $(".js-chat-count").hide();
    }
  }

});