function numWrite(btn) {
  // Based on http://webdevelopersreference.blogspot.com.au/2012/01/on-screen-number-pad-using-javascript.html
  // Do nothing if disabled number key is pressed
  if (btn.classList.contains("disabled")) {
    return
  }

  var n = btn.id.replace("btn","");
  
  var textBox = document.getElementById("pcInput");
  switch (n) {
    case "Back":
      textBox.value = textBox.value.slice(0, -1);
      document.getElementById("pcErr").style.display = "none";
      break;
    case "Clear":
      clearInput();
      break;
    default:
      textBox.value += n;
      break;
  }
  if (textBox.value.length == 4) {
    findPc(textBox.value);
  }
  disableNumBtns(textBox.value);
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
