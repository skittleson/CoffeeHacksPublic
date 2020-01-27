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

var addToCartForm = document.querySelector("#addToCartForm");
if (addToCartForm) {
  addToCartForm.addEventListener("submit", function(event) {
    event.preventDefault();
    CartSave(
      event.srcElement.querySelector(".productId").value,
      event.srcElement.querySelector(".productName").value,
      event.srcElement.querySelector(".productPrice").value,
      event.srcElement.querySelector("#quantitySelect").value,
      event.srcElement.querySelector("#grindSelect").value
    );
    event.srcElement.querySelector(".shake").classList.remove("shake");
    setTimeout(function() {
      BuildCart();
      $(".dropdown-toggle").click();
    }, 500);
  });
}

var productList = document.getElementById("product-list");
if (productList) {
  BuildCart();
}

var paymentForm = document.getElementById("payment-form");
if (paymentForm) {
  document
    .getElementById("same-address")
    .addEventListener("change", function(event) {
      var shippingAddressElement = document.getElementById("shipping-address");
      shippingAddressElement.hidden = event.srcElement.checked;
      shippingAddressElement.disabled = event.srcElement.checked
        ? "disabled"
        : "";
    });
}

function CartSave(productId, name, price, qty, grind) {
  if (productId) {
    var data = {
      qty: Number(qty),
      grind: grind,
      name: name,
      price: Number(price)
    };
    localStorage.setItem(productId, JSON.stringify(data));
  } else {
    throw Error("No product id given");
  }
}

function RemoveItem(productId) {
  localStorage.removeItem(productId);
}

function ClearAll() {
  var keys = Object.keys(localStorage);
  for (var i = 0; i < keys.length; i++) {
    var productId = keys[i];
    if (productId.indexOf("product_") == -1) {
      continue;
    }
    localStorage.removeItem(productId);
  }
}

//--------------------------------------------------------------------------------------
// dynamically populate the table with shopping list items
//below step can be done via PHP and AJAX too.
function BuildCart() {
  if (CheckBrowser()) {
    var list = "";
    var keys = Object.keys(localStorage);
    var totalPrice = 0;
    var totalItems = 0;
    for (var i = 0; i < keys.length; i++) {
      var productId = keys[i];
      if (productId.indexOf("product_") == -1) {
        continue;
      }
      totalItems += 1;
      var cartItemData = JSON.parse(localStorage.getItem(productId));
      var cartItemDisplay =
        '<li class="list-group-item d-flex justify-content-between lh-condensed"><div><h6 class="product-name my-0">$NAME</h6><small class="text-muted">Grind Style: $GRIND</small><br/><small class="text-muted">Qty: $QTY</small></div><span class="product-price text-muted">$$PRICE</span></li>';
      cartItemDisplay = cartItemDisplay.replace("$NAME", cartItemData.name);
      cartItemDisplay = cartItemDisplay.replace("$QTY", cartItemData.qty);
      cartItemDisplay = cartItemDisplay.replace("$GRIND", cartItemData.grind);
      cartItemDisplay = cartItemDisplay.replace(
        "$PRICE",
        cartItemData.price * cartItemData.qty
      );
      totalPrice += cartItemData.price * cartItemData.qty;
      list += cartItemDisplay;
    }
    if (list.length < 1) {
      list =
        '<li class="list-group-item d-flex justify-content-between"><b>Your cart is empty</b></li>';
    }
    var cartSummaryDisplay =
      '<li class="list-group-item d-flex justify-content-between"><span>Total (USD)</span><strong>$$PRICE</strong></li>';
    cartSummaryDisplay = cartSummaryDisplay.replace("$PRICE", totalPrice);
    list += cartSummaryDisplay;
    document.getElementById("productCount").innerText = totalItems;
    document.getElementById("product-list").innerHTML = list;
    if (totalPrice > 0) {
      var submitPaymentBtn = document.getElementById("btnSubmitPaymentForm");
      if (submitPaymentBtn) {
        submitPaymentBtn.disabled = false;
      }
    }
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
