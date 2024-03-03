import React from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import useScript from "../script";
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
  width: "600px",
  height: "600px",
};

const theme = {
  blue: {
    default: "#3f51b5",
    hover: "#283593",
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

Button.defaultProps = {
  theme: "blue",
};

const google = (window.google = window.google ? window.google : {});

function MyComponent() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyASDHVgsFIxrAM_HWWNRCN8_XioS2zX4RM",
  });

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    // const bounds = new window.google.maps.LatLngBounds(center);
    // map.fitBounds(bounds);
    const directionsService = new google.maps.DirectionsService();

    const origin = { lat: location.state.dep.lat, lng: location.state.dep.lng };
    const destination = {
      lat: location.state.des.lat,
      lng: location.state.des.lng,
    };

    if (origin !== null && destination !== null) {
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
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const [directions, setDirections] = React.useState(null);

  const location = useLocation();
  console.log(location);

  const center = {
    lat: location.state.dep.lat,
    lng: location.state.dep.lng,
  };

  const depLong = location.state.dep.lng;
  const depLat = location.state.dep.lat;
  const desLong = location.state.des.lng;
  const desLat = location.state.des.lat;

  const degrees_to_radians = (deg) => (deg * Math.PI) / 180.0;

  const distance =
    Math.acos(
      Math.sin(degrees_to_radians(depLat)) *
        Math.sin(degrees_to_radians(desLat)) +
        Math.cos(degrees_to_radians(depLat)) *
          Math.cos(degrees_to_radians(desLat)) *
          Math.cos(degrees_to_radians(desLong) - degrees_to_radians(depLong))
    ) * 6371;

  const time = distance;
  const hours = Math.floor(time/60);
  const minutes = Math.round(time % 60);

  let service;
  let infowindow;

  function generateEV(e) {
    e.preventDefault();
    console.log("You clicked submit.");
    initMap();
  }

  function initMap() {

    console.log(directions.routes[0].overview_polyline)
    var polyline = require('google-polyline')
    var all_points = polyline.decode(directions.routes[0].overview_polyline)
    console.log(all_points)

    service = new google.maps.places.PlacesService(map);
    var inc = Math.floor(all_points.length/6);
    for (let i = inc; i < all_points.length; i+=inc) {
      console.log(i);
      var request = 
      {
        location: {lat: all_points[i][0], lng: all_points[i][1]},
        radius: 2000,
        type: ["electric_vehicle_charging_station"],
      }

      service.nearbySearch(request, (results, status) => {
        console.log(results);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          for (let i = 0; i < results.length; i++) {
            console.log(results[i]);
            createMarker(results[i]);
          }

          //map.setCenter(results[0].geometry.location);
        }
      });
    }
  }
    

  function createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;

    const marker = new google.maps.Marker({
      map,
      position: place.geometry.location,
    });

    google.maps.event.addListener(marker, "click", () => {
      infowindow.setContent(place.name || "");
      infowindow.open(map);
    });
  }

  return isLoaded ? (
    <div className="map">
      <div className="details">
        <div className="center">
          <h2>Trip Details</h2>
        </div>
        <p>
          Starting Point: {location.state.dep.lng}, {location.state.dep.lat}
        </p>
        <p>
          Destination: {location.state.des.lng}, {location.state.des.lat}
        </p>
        <p>Current Trip Distance: {distance} km</p>
        <p>
          Current Trip Time: {hours}h {minutes}m
        </p>
        <p>Current Battery: {location.state.bat}%</p>

        <BatteryMeter
          batteryLevel={location.state.bat / 100}
          isCharging={false}
        />

        <div className="centerCol">
          <Button onClick={generateEV} className="chargeButton">
            View EV Charging Stations
          </Button>
          <Button className="chargeButton">Reroute!</Button>
        </div>
        <SpotifyWidget />
      </div>

      <div>
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
          {/* <Marker
            onClick={generateEV}
            position={{
              lat: location.state.dep.lat,
              lng: location.state.dep.lng,
            }}
          ></Marker>
          <Marker
            position={{
              lat: location.state.des.lat,
              lng: location.state.des.lng,
            }}
          ></Marker> */}

          <></>
        </GoogleMap>
      </div>

      <div>
        <div className="center">
          <h2>New Trip </h2>
        </div>
        <p>
          Starting Point: {location.state.dep.lat}, {location.state.dep.lng}
        </p>
        <p>
          Destination: {location.state.des.lat}, {location.state.des.lng}
        </p>
        <p>New Trip Distance: {distance} km</p>
        <p>
          Time to Charging Station: <br></br>
          Time to Destination: <br></br>
          New Total Trip Time:
          {hours}h {minutes}m
        </p>
        <p>Charge to: {location.state.bat}% or more</p>

        <BatteryMeter
          batteryLevel={location.state.bat / 100}
          isCharging={true}
        />

        <div className="centerCol">
          <Button onClick={generateEV} className="chargeButton">
            View EV Charging Stations
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}

export default MyComponent;
