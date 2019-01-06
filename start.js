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
    for (i = 0; i < 2; i++) {
      clickThroughQueue();
    }
}

var previousStatus; // "good" if the previous count was not equal to NaN
function clickThroughQueue() {
  previousStatus = "good";
  /*.wait(1000) // IMMEDATELY times out? '[class="begin_exploring"]'
  .click('[class="begin_exploring"]') // For a normal queue
  .click('[id="refresh_queue_btn"]') // For going to another queue after the first one*/
  browser
    .wait('[class="begin_exploring"]') // IMMEDATELY times out?
    .click('[class="begin_exploring"]') // For a normal queue
    .click('[id="refresh_queue_btn"]') // For going to another queue after the first one
    .wait(500) // '[class="btn_next_in_queue"]'
    .evaluate(function () {
      var elem = document.getElementsByClassName('queue_sub_text')[0];
      if (elem) {

        // elem != null
        return elem.innerText;
      } else {
        return null;
      }
    })
    .then(count => {
      if (count != null) { count = parseInt(count.slice(1,3)); }
      if (!count) {
        previousStatus = "bad";
        // TODO: Add exception if you check again and the value is back! STILL A PROBLEM!!! (i.e. double age verif. in a row)
      }
      goToNext();
    })
    .catch(error => {
      console.error('An ERROR occured in clickThroughQueue():', error)
    });
}

function goToNext() {
  //console.log("in goToNext()!");
  browser
    .wait(2000) // 500?
    .click('[class="btn_next_in_queue btn_next_in_queue_trigger"]') // In case there is an age limiter
    .click('[class="next_in_queue_content"]') // Regular game page (without age verification)
    .wait(2000) // .wait('[class="queue_sub_text"]')
    .evaluate(function () {
      var elem = document.getElementsByClassName('queue_sub_text')[0];
      if (elem) {
        // https://stackoverflow.com/a/5515349
        // elem != null
        return elem.innerText;
      } else {
        return null;
      }
    })
    .then(count => {
      //console.log("in count!!!");
      //console.log("count: " + count);
      //if (count) { count = parseInt(count.slice(1,3)); }
      if (previousStatus == "good" /*&& ( || count > 0)*/) {
        //console.log("in second IF STATEMENT");
          if (!count) {
            previousStatus = "bad";
          }
          goToNext();
      }
    })
    .catch(error => {
      console.error('An ERROR occured in goToNext():', error)
    })
}
