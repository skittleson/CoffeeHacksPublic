if ("serviceWorker" in navigator) {
  if (navigator.serviceWorker.controller) {
    console.log(
      "[PWA Builder] active service worker found, no need to register"
    );
  } else {
    // Register the service worker
    navigator.serviceWorker
      .register("sw.js", {
        scope: "./"
      })
      .then(function(reg) {
        console.log(
          "[PWA Builder] Service worker has been registered for scope: " +
            reg.scope
        );
      });
  }
}

function AddItem() {
  var productId = document.querySelector(".productIdInput").value;
  var data = {
    qty: document.querySelector("#quantitySelect").value,
    grind: document.querySelector("#grindSelect").value
  };
  localStorage.setItem(productId, data);
  //doShowAll();
}

function RemoveItem(productId) {
  localStorage.removeItem(productId);
  //doShowAll();
}

function ClearAll() {
  localStorage.clear();
  //doShowAll();
}
//--------------------------------------------------------------------------------------
// dynamically populate the table with shopping list items
//below step can be done via PHP and AJAX too.
function doShowAll() {
  if (CheckBrowser()) {
    var key = "";
    var list = "<tr><th>Item</th><th>Value</th></tr>\n";
    var i = 0;
    //for more advance feature, you can set cap on max items in the cart
    for (i = 0; i <= localStorage.length - 1; i++) {
      key = localStorage.key(i);
      list +=
        "<tr><td>" +
        key +
        "</td>\n<td>" +
        localStorage.getItem(key) +
        "</td></tr>\n";
    }
    //if no item exists in the cart
    if (list == "<tr><th>Item</th><th>Value</th></tr>\n") {
      list += "<tr><td><i>empty</i></td>\n<td><i>empty</i></td></tr>\n";
    }
    //bind the data to html table
    //you can use jQuery too....
    document.getElementById("list").innerHTML = list;
  } else {
    alert("Cannot save shopping list as your browser does not support HTML 5");
  }
}

/*
 =====> Checking the browser support
 //this step may not be required as most of modern browsers do support HTML5
 */
//below function may be redundant
function CheckBrowser() {
  if ("localStorage" in window && window["localStorage"] !== null) {
    // we can use localStorage object to store data
    return true;
  } else {
    return false;
  }
}
