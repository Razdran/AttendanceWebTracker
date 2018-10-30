var collapsed = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < collapsed.length; i++) {
    collapsed[i].addEventListener("click", function() {
        /* Toggle between adding and removing the "active" class,
        to highlight the button that controls the panel */
        this.classList.toggle("active");

        /* Toggle between hiding and showing the active panel */
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
        if (content.style.maxHeight){
            content.style.maxHeight = null;
          } else {
            content.style.maxHeight = content.scrollHeight + "px";
          } 
    });
}