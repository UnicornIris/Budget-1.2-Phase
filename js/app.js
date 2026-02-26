function openTab(tabName, elmnt) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }

  var targetTab = document.getElementById(tabName);
  if (targetTab) {
    targetTab.style.display = (tabName === "Text") ? "flex" : "block";
  }

  elmnt.classList.add("active");
}

document.addEventListener("DOMContentLoaded", function() {
  var defaultTab = document.getElementById("defaultOpen");
  if (defaultTab) {
    defaultTab.click();
  }
});

function showWarning() {
  document.getElementById("profileWarning").style.display = "block";
}

function closeWarning() {
  document.getElementById("profileWarning").style.display = "none";
}
