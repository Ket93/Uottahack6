import React from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import weather from "../clouds.png";
import wind from "../wind.png";
import BatteryMeter from "../BatteryMeter";
import SpotifyWidget from "../components/SpotifyWigdet";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { all } from "q";

const containerStyle = {
  width: "500px",
  height: "500px",
};

const theme = {
  blue: {
    default: "#3f51b5",
    hover: "#283593",
  },
  green: {
    default: "#26bf34",
    hover: "#20b32d",
  },
};

const Button = styled.button`
  background-color: ${(props) => theme[props.theme].default};
  color: white;
  padding: 5px 15px;
  border-radius: 5px;
  height: 30px;
  outline: 0;
  border: 0;
  text-transform: uppercase;
  margin: 10px 0px;
  cursor: pointer;
  box-shadow: 0px 2px 2px lightgray;
  transition: ease background-color 250ms;
  &:hover {
    background-color: ${(props) => theme[props.theme].hover};
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

const Button2 = styled.button`
  background-color: ${(props) => theme[props.theme].default};
  color: white;
  padding: 5px 15px;
  border-radius: 5px;
  height: 30px;
  outline: 0;
  border: 0;
  text-transform: uppercase;
  margin: 10px 0px;
  cursor: pointer;
  box-shadow: 0px 2px 2px lightgray;
  transition: ease background-color 250ms;
  &:hover {
    background-color: ${(props) => theme[props.theme].hover};
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

Button.defaultProps = {
  theme: "blue",
};

Button2.defaultProps = {
  theme: "green",
};

const google = (window.google = window.google ? window.google : {});
let markers = []
function MyComponent() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyASDHVgsFIxrAM_HWWNRCN8_XioS2zX4RM",
  });

  const [map, setMap] = React.useState(null);
  const [directions, setDirections] = React.useState(null);


  //const [stop, setStop] = React.useState();

  var stop = null;
  const setStop = (l) => {
    stop = l;
  }

  function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }

  function hideMarkers() {
    setMapOnAll(null);
  }

  function deleteMarkers() {
    hideMarkers();
    markers = [];
  }

  const route = () => {
    const directionsService = new google.maps.DirectionsService();

    const origin = { lat: location.state.dep.lat, lng: location.state.dep.lng };
    const destination = {
      lat: location.state.des.lat,
      lng: location.state.des.lng,
    };

    if (origin !== null && destination !== null) {
      var wp = []
      console.log(stop)
      if (stop) {
        wp.push({
          location: stop,
          stopover: true,
        });
      }

      console.log(wp)

      directionsService.route(
        {
          origin: new google.maps.LatLng(
            location.state.dep.lat,
            location.state.dep.lng
          ),
          destination: new google.maps.LatLng(
            location.state.des.lat,
            location.state.des.lng
          ),
          travelMode: google.maps.TravelMode.DRIVING,
          waypoints: wp,
          optimizeWaypoints: true
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            //console.log(result)
            setDirections(result);
            console.log(directions);
          } else {
            console.error(`error fetching directions ${result}`);
          }
        }
      );
    } else {
      console.log("Please mark your destination in the map first!");
    }
    deleteMarkers();
  }

  const onLoad = React.useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    // const bounds = new window.google.maps.LatLngBounds(center);
    // map.fitBounds(bounds);
    route()
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);


  const location = useLocation();

  const center = {
    lat: location.state.dep.lat,
    lng: location.state.dep.lng,
  };

  const depLong = location.state.dep.lng;
  const depLat = location.state.dep.lat;
  const desLong = location.state.des.lng;
  const desLat = location.state.des.lat;

  const degrees_to_radians = (deg) => (deg * Math.PI) / 180.0;

  const distance = getDistance(depLat, depLong, desLat, desLong);

  function getDistance(depLat, depLong, desLat, desLong) {
    return (
      Math.acos(
        Math.sin(degrees_to_radians(depLat)) *
          Math.sin(degrees_to_radians(desLat)) +
          Math.cos(degrees_to_radians(depLat)) *
            Math.cos(degrees_to_radians(desLat)) *
            Math.cos(degrees_to_radians(desLong) - degrees_to_radians(depLong))
      ) * 6371
    );
  }

  const time = distance;
  const hours = Math.floor(time / 80);
  const minutes = Math.round(time % 60);

  let service;

  function generateEV(e) {
    e.preventDefault();
    console.log("You clicked submit.");
    initMap();
  }

  function initMap() {

    //console.log(directions.routes[0].overview_polyline)
    var polyline = require('google-polyline')
    var all_points = polyline.decode(directions.routes[0].overview_polyline)
    //console.log(all_points)

    service = new google.maps.places.PlacesService(map);
    var inc = Math.floor(all_points.length/6);
    for (let i = inc; i < all_points.length; i+=inc) {
      //console.log(i);
      var request = 
      {
        location: {lat: all_points[i][0], lng: all_points[i][1]},
        radius: 500,
        type: ["electric_vehicle_charging_station"],
      };

      service.nearbySearch(request, (results, status) => {
        //console.log(results);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          for (let i = 0; i < results.length; i++) {
            //console.log(results[i]);
            createMarker(results[i]);
          }

          //map.setCenter(results[0].geometry.location);
        }
      });
    }
  }

  let EVlng;
  let EVlat;
  let EVdistance;

  function createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;

    const marker = new google.maps.Marker({
      map,
      position: place.geometry.location,
    });
    markers.push(marker)
    google.maps.event.addListener(marker, "click", () => {
      console.log(place);
      setStop(place.geometry.location);
      console.log(stop);
      route();
      EVlng = place.geometry.location.lng();
      EVlat = place.geometry.location.lat();
      EVdistance =
        Math.round(
          (getDistance(depLat, depLong, EVlat, EVlng) +
            getDistance(EVlat, EVlng, desLat, desLong)) *
            100
        ) / 100;
      let distChange = Math.round((EVdistance - distance) * 100) / 100;
      document.getElementById("EVtrip").innerText =
        `
        Change in Trip Distance: ` +
        distChange +
        `km
        New Trip Distance: ` +
        EVdistance +
        `km`;

      const EVhours = Math.floor(EVdistance / 80);
      const EVminutes = Math.round(EVdistance % 60);
      const EVhoursChange = Math.floor(distChange / 80);
      const EVminutesChange = Math.round(distChange % 60);
      document.getElementById("EVtime").innerText =
        `Change in Trip Time: ` +
        EVhoursChange +
        `h ` +
        EVminutesChange +
        `m
        New Trip Time: ` +
        EVhours +
        `h ` +
        EVminutes +
        `m`;

      document.getElementById(
        "EVcharge"
      ).innerText = `Estimated Battery at Arrival: 16%
         Charge to: 56% or more`;

      document.getElementById("tripStatus").innerText = `CAN MAKE TRIP`;
      document.getElementById("tripStatus").style.color = "green";
    });
  }

  return isLoaded ? (
    <div className="map">
      <div className="details">
        <div className="weather">
          <img className="weather" src={weather} alt=""></img>
          <p className="degrees">-2 Degrees</p>
          <img className="wind" src={wind} alt=""></img>
          <p className="tailwind">32km/h Tailwind</p>
        </div>
        <div className="center">
          <h2 className="tripDetails">Trip Details</h2>
        </div>
        <p>
          Starting Point: {location.state.dep.lng}, {location.state.dep.lat}
        </p>
        <p>
          Destination: {location.state.des.lng}, {location.state.des.lat}
        </p>
        <p>Current Trip Distance: {Math.floor(distance * 100) / 100} km</p>
        <p>
          Current Trip Time: {hours}h {minutes}m
        </p>
        <p>Estimated Battery Change from Temperature: -7%</p>
        <p>Estimated Battery Change from Tailwind: +3%</p>
        <p>Adjusted Estimated Battery: {location.state.bat - 7 + 3}%</p>

        <BatteryMeter
          batteryLevel={location.state.bat / 100}
          isCharging={false}
        />

        <div className="centerCol">
          <p id="tripStatus">CANNOT MAKE TRIP</p>
          <Button onClick={generateEV} className="chargeButton">
            View EV Charging Stations
          </Button>
          <Button className="chargeButton">Reroute!</Button>
        </div>
      </div>

      <div>
        <SpotifyWidget />
        <GoogleMap
          id="map"
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          <DirectionsRenderer
            directions={directions}
            defaultOptions={{
              suppressMarkers: true,
            }}
          />

          <></>
        </GoogleMap>
      </div>

      <div className="EvTrip">
        <div className="center">
          <h2>New Trip </h2>
        </div>
        <p id="EVtrip">
          Change in Trip Distance: <br></br>
          New Trip Distance:
        </p>

        <p id="EVcharge">
          Estimated Battery at Arrival: <br></br>
          Charge to:
        </p>

        <p id="EVtime">
          Change in Trip Time: <br></br>
          New Trip Time:
        </p>

        <BatteryMeter
          batteryLevel={location.state.bat / 100}
          isCharging={true}
        />

        <div className="centerCol">
          <Button2 onClick={generateEV} className="evChargeButton">
            Go!
          </Button2>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}

export default MyComponent;
