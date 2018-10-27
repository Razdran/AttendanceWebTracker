function contactMap()
{
  var mapCenter=new google.maps.LatLng(47.173998,27.574912);
  var options={
    center:mapCenter,
    zoom:18,
  };
  var map=new google.maps.Map(document.getElementById("map"),options);
  var marker = new google.maps.Marker({position:mapCenter});
  marker.setMap(map);
}
