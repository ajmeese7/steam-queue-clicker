var Nightmare = require('nightmare');
var browser = new Nightmare({show: true, typeInterval: 50, pollInterval: 50});
// NOTE: How to make it use the installed Electron instead of re-downloading?

// IDEA: Add a way to cycle through multiple accounts for users with `botnets`
var password = "YOUR_password_HERE";
login(username, password);

function login(username, password) {
  browser
    .goto('https://store.steampowered.com/login')
    .wait('[id="input_username"]')
    .type('[id="input_username"]', username)
    .type('[id="input_password"]', password)
    .click('[class="btnv6_blue_hoverfade  btn_medium"]') // NOTE: DO NOT remove the double space. It is required.
    .wait('[id="home_maincap_v7"]') // This gives you 30 seconds to enter your Steam guard code (if applicable)
    .then(function() {
      clickThroughQueue();
    });
}

var queuesClickedThrough = 0;
function clickThroughQueue() {
  // NOTE: For some reason there is ~10 second delay between clicking queues
  queuesClickedThrough++;

  // NOTE: Change the 3 to however many queues you want to click through.
  if (queuesClickedThrough <= 3) {
    console.log("clickThroughQueue() time #: " + queuesClickedThrough);
    if (queuesClickedThrough < 2) {
      browser
        .wait('[class="begin_exploring"]')
        .click('[class="begin_exploring"]')
        .then(function() {
          continueQueue();
        });
    } else {
      continueQueue();
    }
  } else {
    // NOTE: Now this case isn't running, so Electron isn't closing. Test again w/ <3?
    console.log("clickThroughQueue() is done!");
    browser.wait(5000).end();
  }
}

function continueQueue() {
  // TODO: Optimize timings!!
  browser
    .wait(2000)
    .evaluate(function () {
      var queueOver = document.getElementById('refresh_queue_btn');
      if (!queueOver) {
        return true;
      } else {
        return null;
      }
    })
    .then(queueNotOver => {
      if (queueNotOver) {
        return browser
          .click('[class="btn_next_in_queue btn_next_in_queue_trigger"]') // In case there is an age limiter
          .click('[class="next_in_queue_content"]') // Regular game page (without age verification)
          .then(function() {
              continueQueue();
          })
          .catch(error => {
            // The split is to remove all the trailing error lines after the first
            console.error('An ERROR occured in continueQueue() IF STATEMENT:', error.toString().split(/\r?\n/)[0])
          })
      } else {
        console.log("queue is DONE...");
        return browser
          .click('[class="btnv6_lightblue_blue btn_medium"]')
          .then(function() {
              clickThroughQueue();
          });
      }
    })
    .catch(error => {
      console.error('An ERROR occured in continueQueue():', error.toString().split(/\r?\n/)[0])
    })
}
