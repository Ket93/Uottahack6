import React from "react";
import { useLocation, useParams } from "react-router-dom";
import styled from "styled-components";
import useScript from "../script";
import BatteryMeter from "../BatteryMeter";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";

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

    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

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

  const time = distance / 80;
  const hours = Math.floor(time);
  const minutes = Math.round(time % 60);

  // getting directions

  // const directionsService = new window.google.maps.DirectionsService();

  // const origin = { lat: -34.397, lng: 150.644 };
  // const destination = { lat: -34.397, lng: 150.644 };

  // if (origin !== null && destination !== null) {
  //   directionsService.route(
  //     {
  //       origin: origin,
  //       destination: destination,
  //       travelMode: new window.google.maps.TravelMode.DRIVING(),
  //     },
  //     (result, status) => {
  //       if (status === new window.google.maps.DirectionsStatus.OK()) {
  //         this.setState({
  //           directions: result,
  //         });
  //       } else {
  //         console.error(`error fetching directions ${result}`);
  //       }
  //     }
  //   );
  // } else {
  //   console.log("Please mark your destination in the map first!");
  // }

  return isLoaded ? (
    <div className="map">
      <div className="details">
        <div className="center">
          <h2>Trip Details</h2>
        </div>
        <p>
          Starting Point: {location.state.dep.lat}, {location.state.dep.lng}
        </p>
        <p>
          Destination: {location.state.des.lat}, {location.state.des.lng}
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

        <div className="center">
          <Button>Reroute with EV Stations!</Button>
        </div>
      </div>

      <div>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          <Marker
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
          ></Marker>
          {/* <DirectionsRenderer
          directions={this.state.directions}
          defaultOptions={{
            suppressMarkers: true,
          }} 
        />*/}
          <></>
        </GoogleMap>
      </div>
    </div>
  ) : (
    <></>
  );
}

export default MyComponent;
