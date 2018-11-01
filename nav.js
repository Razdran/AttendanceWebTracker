var mq = window.matchMedia( "(max-width: 1000px)" );
if(mq.matches)
{
    function openNav(){
        document.getElementById("sideNav").style.width="250px";
        document.getElementById("sideNav").style.zIndex="10";
    }
    function closeNav(){
        document.getElementById("sideNav").style.width="0"
        ;
    }

}
else {

    function openNav(){
        document.getElementById("sideNav").style.width="250px";
        document.getElementById("container").style.marginLeft="250px";
    }
    function closeNav(){
        document.getElementById("sideNav").style.width="0";
        document.getElementById("container").style.marginLeft="0";
    }
}
