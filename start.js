var Nightmare = require('nightmare');
const fs = require('fs');
var browser = new Nightmare({show: true, typeInterval: 75, pollInterval: 250});
// NOTE: How to make it use the installed Electron instead of re-downloading?

var username = "YOUR_username_HERE";
var password = "YOUR_password_HERE";
login(username, password);

// Change the middle value for the number of queues you want to go through
for (i = 0; i < 2; i++) {
  clickThroughQueue();
}

function login(username, password) {
  // NOTE: You must manually enter your Steam mobile guard code if applicable
  browser
    .goto('https://store.steampowered.com/login')
    .wait('[id="input_username"]')
    .type('[id="input_username"]', username)
    .type('[id="input_password"]', password)
    .click('[class="btnv6_blue_hoverfade  btn_medium"]') // Should this be here?
}

function clickThroughQueue() {
  browser
    .wait('[class="begin_exploring"]')
    .click('[class="begin_exploring"]')
    .evaluate(() => document.getElementsByClassName('queue_sub_text')[0].innerText)
    .then(count => {
      count = parseInt(count.slice(1,3));
      console.log(count);
      if (count > 0) { goToNext() }
    })
}

function goToNext() {
  console.log("in goToNext()!")
  browser
    .wait('[class="next_in_queue_content"]')
    .click('[class="next_in_queue_content"]')
    .wait('[class="queue_sub_text"]') // TODO: Test when the count is gone (last item in queue)
    .evaluate(() => document.getElementsByClassName('queue_sub_text')[0].innerText)
    .then(count => {
      count = parseInt(count.slice(1,3));
      console.log(count);
      if (count > 0) { goToNext() }
    })
}
