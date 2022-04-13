import "regenerator-runtime/runtime";

import { initContract, login, logout } from "./utils";

import getConfig from "./config";
const { networkId } = getConfig(process.env.NODE_ENV || "testnet");

// global variable used throughout
let currentGreeting;

const submitButton = document.querySelector("form button");

document.querySelector("input#hello_world").oninput = (event) => {
  if (event.target.value !== currentGreeting) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
};

document.querySelector("#sign-in-button").onclick = login;
document.querySelector("#sign-out-button").onclick = logout;

// Display the signed-out-flow container
function signedOutFlow() {
  document.querySelector("#signed-out-flow").style.display = "block";
}

// Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
  document.querySelector("#signed-in-flow").style.display = "block";

  document.querySelectorAll("[data-behavior=account-id]").forEach((el) => {
    el.innerText = window.accountId;
  });

  // populate links in the notification box
  const accountLink = document.querySelector(
    "[data-behavior=notification] a:nth-of-type(1)"
  );
  accountLink.href = accountLink.href + window.accountId;
  accountLink.innerText = "@" + window.accountId;
  const contractLink = document.querySelector(
    "[data-behavior=notification] a:nth-of-type(2)"
  );
  contractLink.href = contractLink.href + window.contract.contractId;
  contractLink.innerText = "@" + window.contract.contractId;

  // update with selected networkId
  accountLink.href = accountLink.href.replace("testnet", networkId);
  contractLink.href = contractLink.href.replace("testnet", networkId);
}

// update global currentGreeting variable; update DOM with it
async function fetchGreeting() {
  currentGreeting = await contract.get_greeting({
    account_id: window.accountId,
  });
  document.querySelectorAll("[data-behavior=greeting]").forEach((el) => {
    // set divs, spans, etc
    el.innerText = currentGreeting;

    // set input elements
    el.value = currentGreeting;
  });
}

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
  .then(() => {
    if (window.walletConnection.isSignedIn()) signedInFlow();
    else signedOutFlow();
  })
  .catch(console.error);

const hello_world_button = document.querySelector("button#hello_world");

hello_world_button.onclick = () => {
  hello_world_button.innerHTML =
    '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" style="margin-right: 5px"></span>Sending...';
  hello_world_button.disabled = true;
  window.contract
    .get_answer({ name: document.querySelector("input#hello_world").value })
    .then((result) => {
      document.querySelector("h1#result").innerHTML = result;
      hello_world_button.innerHTML = "Submit";
      hello_world_button.disabled = false;
    })
    .catch((err) => {
      console.log(err);
    });
};
