var Nightmare = require('nightmare');
var browser = new Nightmare({show: true, typeInterval: 75, pollInterval: 50}); // poll 250
// NOTE: How to make it use the installed Electron instead of re-downloading?

var username = "YOUR_username_HERE";
var password = "YOUR_password_HERE";
login(username, password);
// NOTE: TEMPORARILY__ calling clickThroughQueue() from end of login to bypass async requirements

function login(username, password) {
  // NOTE: You must manually enter your Steam mobile guard code if applicable
  browser
    .goto('https://store.steampowered.com/login')
    .wait('[id="input_username"]')
    .type('[id="input_username"]', username)
    .type('[id="input_password"]', password)
    .click('[class="btnv6_blue_hoverfade  btn_medium"]'); // NOTE: DO NOT remove the double space. It is required.

    // Change the middle value for the number of queues you want to go through
    for (i = 1; i < 3; i++) {
      clickThroughQueue();
    }
}

var previousStatus; // "good" if the previous count was not equal to NaN
function clickThroughQueue() {
  previousStatus = "good";
  browser
    .wait('[class="begin_exploring"]') // IMMEDATELY times out?
    .click('[class="begin_exploring"]') // For a normal queue
    //.click('[id="refresh_queue_btn"]') // For going to another queue after the first one
    .wait(500)
    .evaluate(function () {
      // Is this the search that I need to use? Should it be the next button itself?
      var elem = document.getElementsByClassName('next_in_queue_content')[0];
      if (elem) {
        return true;
      } else {
        return null;
      }
    })
    .then(count => {
      if (!count) {
        previousStatus = "bad";
      }
      goToNext();
    })
    .catch(error => {
      // The split is to remove all the trailing error lines after the first
      console.error('An ERROR occured in clickThroughQueue():', error.toString().split(/\r?\n/)[0])
    });
}

function goToNext() {
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
    .then(continueQueue => {
      if (continueQueue) {
        return browser
          .click('[class="btn_next_in_queue btn_next_in_queue_trigger"]') // In case there is an age limiter
          .click('[class="next_in_queue_content"]') // Regular game page (without age verification)
          .wait(2000)
          .evaluate(function () {
            var elem = document.getElementsByClassName('next_in_queue_content')[0];
            if (elem) {
              return true;
            } else {
              return null;
            }
          })
          .then(count => {
            if (previousStatus == "good") {
                if (!count) {
                  previousStatus = "bad";
                }
                goToNext();
            }
          })
          .catch(error => {
            console.error('An ERROR occured in goToNext() IF STATEMENT:', error.toString().split(/\r?\n/)[0])
          })
      } else {
        console.log("queue is DONE, according to goToNext()...");
        return browser
          .click('[class="btnv6_lightblue_blue btn_medium"]');
      }
    })
    .catch(error => {
      console.error('An ERROR occured in goToNext():', error.toString().split(/\r?\n/)[0])
    })
}
