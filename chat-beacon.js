// JS for showing/hiding the chat iframe and updating the beacon #
// vanilla jQuery

$(function() {
  var chatFrameLoaded = false;
  var chatFrameOpened = false;

  function updateUnreadCount(count) {
    if (count > 0) {
      $(".js-chat-count").html(count).show();
    } else {
      $(".js-chat-count").hide();
    }
  }

  // set up initial beacon value from bootstrap
  updateUnreadCount(chatBeaconBootstrap.unreadReplies);

  // click handler on chat bubble
  $(".js-show-chat").click(function() {
    if (chatFrameOpened) {
      $(".js-chat-iframe-container").fadeOut(125, function() {
        chatFrameOpened = false;
      });
    } else {
      $(".js-chat-iframe-container").fadeIn(125, function() {
        chatFrameOpened = true;
      });

      if (!chatFrameLoaded) {
        $(".js-chat-iframe-container iframe").attr('src',chatBeaconBootstrap.streamAppURL)[0].onload = function() {
          chatFrameLoaded = true;
        };
      }
    }
  });

});