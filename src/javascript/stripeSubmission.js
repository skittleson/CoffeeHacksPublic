var stripeKeyElement = document.getElementById("stripeKey");
if (stripeKeyElement) {
  var stripe = Stripe(stripeKeyElement.value);
  var elements = stripe.elements();

  var card = elements.create("card", {
    iconStyle: "solid",
    hidePostalCode: true,
    style: {
      base: {
        iconColor: "#8898AA",
        color: "black",
        lineHeight: "36px",
        fontWeight: 300,
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: "19px",

        "::placeholder": {
          color: "darkgrey"
        }
      },
      invalid: {
        iconColor: "#e85746",
        color: "#e85746"
      }
    },
    classes: {
      focus: "is-focused",
      empty: "is-empty"
    }
  });
  card.mount("#card-element");

  var inputs = document.querySelectorAll("input.field");
  Array.prototype.forEach.call(inputs, function(input) {
    input.addEventListener("focus", function() {
      input.classList.add("is-focused");
    });
    input.addEventListener("blur", function() {
      input.classList.remove("is-focused");
    });
    input.addEventListener("keyup", function() {
      if (input.value.length === 0) {
        input.classList.add("is-empty");
      } else {
        input.classList.remove("is-empty");
      }
    });
  });

  function setOutcome(result) {
    var successElement = document.querySelector(".success");
    var errorElement = document.querySelector(".error");
    successElement.classList.remove("visible");
    errorElement.classList.remove("visible");

    if (result.token) {
      // Use the token to create a charge or a customer
      // https://stripe.com/docs/payments/charges-api
      successElement.querySelector(".token").textContent = result.token.id;
      successElement.classList.add("visible");
    } else if (result.error) {
      errorElement.textContent = result.error.message;
      errorElement.classList.add("visible");
    }
  }

  document.querySelector("form").addEventListener("submit", function(e) {
    e.preventDefault();
    var form = document.querySelector("form");
    var browserClientReportValidity = form.reportValidity();
    if (!browserClientReportValidity) {
      return;
    }
    var extraDetails = GetBillingDetails(form);
    stripe.createToken(card, extraDetails).then(SubmitForConfirmation);
  });
}

function GetBillingDetails(form) {
  var result = {
    name:
      form.querySelector("#firstName").value +
      " " +
      form.querySelector("#lastName").value,
    address_country: form.querySelector("#country").value,
    address_city: form.querySelector("#city").value,
    address_line1: form.querySelector("#address").value,
    address_state: form.querySelector("#state").value,
    address_zip: form.querySelector("#zip").value
  };
  if (form.querySelector("#address2").value.length > 0) {
    result.address_line2 = form.querySelector("#address2").value;
  }
  return result;
}

function SubmitForConfirmation(result) {
  if (result.token) {
    // Use the token to create a charge or a customer
    // https://stripe.com/docs/payments/charges-api
    var form = document.querySelector("form");
    var request = {
      firstName: form.querySelector("#firstName").value,
      lastName: form.querySelector("#lastName").value,
      stripe: result.token,
      email: form.querySelector("#email").value,
      phone: form.querySelector("#phone").value,
      shippingSame: form.querySelector("#same-address").checked,
      cart: []
    };
    if (!request.shippingSame) {
      request.shipping = {
        firstName: form.querySelector("#shippingFirstName").value,
        lastName: form.querySelector("#shippingLastName").value,
        address_country: form.querySelector("#shippingCountry").value,
        address_city: form.querySelector("#shippingCity").value,
        address_line1: form.querySelector("#shippingAddress").value,
        address_line2: form.querySelector("#shippingAddress2").value,
        address_state: form.querySelector("#shippingState").value,
        address_zip: form.querySelector("#shippingZip").value
      };
    }
    var keys = Object.keys(localStorage);
    for (var i = 0; i < keys.length; i++) {
      var productId = keys[i];
      if (productId.indexOf("product_") == -1) {
        continue;
      }
      var cartItem = JSON.parse(localStorage.getItem(productId));
      request.cart.push({
        productId: productId,
        priceOnSite: cartItem.price
      });
    }
    var jsonRequest = JSON.stringify(request);
    console.log(jsonRequest);
    var api = document.querySelector("#api").value;
    fetch(api + "/payment", {
      method: "post",
      body: jsonRequest
    }).then(function(response) {
      console.log(response);
      ClearAll();
      //window.location.href = "./thankyou";
    });
  } else if (result.error) {
    alert(result.error.message);
  }
}
