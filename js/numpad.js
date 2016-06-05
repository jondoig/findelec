function numWrite(n) {
  // Based on http://webdevelopersreference.blogspot.com.au/2012/01/on-screen-number-pad-using-javascript.html

  // Do nothing if disabled number key is pressed
  if (document.getElementById("btn" + n).classList.contains("disabled")) {
    return
  }

  var text_box = document.getElementById("pcInput");
  switch (n) {
    case "back":
      text_box.value = text_box.value.slice(0, -1);
      break;
    case "clear":
      text_box.value = "";
      break;
    default:
      text_box.value += n;
      break;
  }
//  if (text_box.value.length == 4) {
//    console.log("Bingo! Postcode is " + text_box.value +
//      ".\nClose numpad and process postcode.");
//  }
  disableNumBtns(text_box.value);
}

function disableNumBtns(n) {
  // Pattern matches any full or partial Australian Postcode:
  //      /^(
  //        0(8([0-9][0-9]?)?)?
  //        |^[2-4]([0-9]([0-9][0-9]?)?)?
  //        |^5([0-8]([0-9][0-9]?)?)?
  //        |^6([0-6]([0-9][0-9]?)?)?
  //        |^6(7([0-8][0-9]?)?)?
  //        |^6(7(9[0-7]?)?)?
  //        |^7([0-7]([0-9][0-9]?)?)?
  //      )$/

  var pattern = /^(0(8([0-9][0-9]?)?)?|^[2-4]([0-9]([0-9][0-9]?)?)?|^5([0-8]([0-9][0-9]?)?)?|^6([0-6]([0-9][0-9]?)?)?|^6(7([0-8][0-9]?)?)?|^6(7(9[0-7]?)?)?|^7([0-7]([0-9][0-9]?)?)?)$/;

  for (var b = 0; b <= 9; b++) {
    var elem = document.getElementById("btn" + b);
    if (pattern.test(n + b)) {
      elem.classList.remove("disabled");
    } else {
      elem.classList.add("disabled");
    }
  }
}
