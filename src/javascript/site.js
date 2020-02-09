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
    var product = event.srcElement.querySelector("#subscribeSelect");
    console.log(product);
    CartSave(
      product.value,
      event.srcElement.querySelector(".productName").value,
      product.options[product.selectedIndex].getAttribute("price"),
      event.srcElement.querySelector("#quantitySelect").value,
      event.srcElement.querySelector("#grindSelect").value,
      product.options[product.selectedIndex].getAttribute("subscription")
    );
    var shakeEle = event.srcElement.querySelector(".shake");
    if (shakeEle) {
      shakeEle.classList.remove("shake");
    }
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

var couponForm = document.getElementById("coupon-form");
if (couponForm) {
  couponForm.addEventListener("submit", function(event) {
    event.preventDefault();
    var couponText = couponForm.getElementsByClassName("form-control")[0];

    // TODO (spencerk,20200209): this should be pulled from an api call to validate this is an actual coupon.
    var coupon = "firstorder";
    if (couponText.value === coupon) {
      localStorage.setItem(
        "coupon",
        JSON.stringify({ discount: 0.1, coupon: coupon })
      );
      BuildCart();
    } else {
      alert("Not a valid a coupon");
    }
  });
}

function CartSave(productId, name, price, qty, grind, subscribe) {
  if (productId) {
    var data = {
      qty: Number(qty),
      grind: grind,
      name: name,
      price: Number(price),
      subscribe: subscribe == "true"
    };
    localStorage.setItem(productId, JSON.stringify(data));
  } else {
    throw Error("No product id given");
  }
}

function RemoveItem(productId) {
  localStorage.removeItem(productId);
  BuildCart();
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
        '<li class="list-group-item d-flex justify-content-between lh-condensed"><div><h6 class="product-name my-0">$NAME</h6><small class="text-muted">Grind Style: $GRIND</small><br/><small class="text-muted">Qty: $QTY</small>$SUBSCRIBE</div><div class="text-right"><span class="product-price text-muted">$$PRICE</span></br></br><small><button class="btn btn-link" onclick="RemoveItem(\'$PRODUCT_ID\');">remove</button></small></div></li>';
      cartItemDisplay = cartItemDisplay.replace("$PRODUCT_ID", productId);
      cartItemDisplay = cartItemDisplay.replace("$NAME", cartItemData.name);
      cartItemDisplay = cartItemDisplay.replace("$QTY", cartItemData.qty);
      cartItemDisplay = cartItemDisplay.replace("$GRIND", cartItemData.grind);
      var subscribe = "";
      if (cartItemData.subscribe) {
        subscribe = '<br/><small class="text-muted">Recurring: Monthly</small>';
      }
      cartItemDisplay = cartItemDisplay.replace("$SUBSCRIBE", subscribe);
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
    var couponStore = localStorage.getItem("coupon");
    var couponDiscount = 0.0;
    if (couponStore) {
      couponStore = JSON.parse(couponStore);
      couponDiscount = Number(couponStore.discount) * totalPrice;
      couponDiscount =
        Math.round((couponDiscount + Number.EPSILON) * 100) / 100;
      var couponToAdd =
        '<li class="list-group-item d-flex justify-content-between bg-light"><div class="text-success"><h6 class="my-0">Promo code</h6><small>$COUPON</small></div><span class="text-success">-$$AMOUNT</span></li>';
      couponToAdd = couponToAdd.replace("$COUPON", couponStore.coupon);
      couponToAdd = couponToAdd.replace("$AMOUNT", couponDiscount);
      list += couponToAdd;
    }
    totalPrice -= couponDiscount;
    totalPrice = Math.round((totalPrice + Number.EPSILON) * 100) / 100;
    var cartSummaryDisplay =
      '<li class="list-group-item d-flex justify-content-between"><span>Total (USD)</span><strong>$$PRICE</strong></li>';
    cartSummaryDisplay = cartSummaryDisplay.replace("$PRICE", totalPrice);
    list += cartSummaryDisplay;
    document.getElementById("productCount").innerText = totalItems;
    document.getElementById("product-list").innerHTML = list;
    var submitPaymentBtn = document.getElementById("btnSubmitPaymentForm");
    if (submitPaymentBtn) {
      submitPaymentBtn.disabled = totalPrice < 1;
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
