import React from "react";
import "../styles/SearchScreen.css";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useLoadScript } from "@react-google-maps/api";
import ford from "../Ford.png";
import { useState } from "react";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

export default function SearchScreen() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyASDHVgsFIxrAM_HWWNRCN8_XioS2zX4RM",
    libraries: ["places"],
  });

  if (!isLoaded) return <div>Loading...</div>;
  return <Search />;
}

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

function Search() {
  const [departure, setDeparture] = useState(null);
  const [destination, setDestination] = useState(null);
  const [battery, setBattery] = useState(0);

  const navigate = useNavigate();

  const handleBatteryChange = (e) => {
    setBattery(+e.target.value);
  };

  return (
    <div className="container">
      <div className="image">
        <img className="ford" src={ford} alt=""></img>
      </div>
      <div className="SearchScreen">
        <div className="dep">
          Where are you starting?
          <PlacesAutocomplete id="input" setSelected={setDeparture} />
        </div>
        <div className="des">
          Where are you going?
          <PlacesAutocomplete id="input" setSelected={setDestination} />
        </div>
        <div className="battery">
          <input
            className="battery_input"
            type="range"
            min="0"
            max="100"
            value={battery}
            onChange={handleBatteryChange}
          />
          <div>
            <label for="battery">Battery Level {battery}%</label>
          </div>
        </div>
        <div>
          <Button
            className="submitButton"
            onClick={() => {
              console.log(battery);
              navigate("/map", {
                state: { dep: departure, des: destination, bat: battery },
              });
            }}
          >
            Find Route!
          </Button>
        </div>
      </div>
    </div>
  );
}

const PlacesAutocomplete = ({ setSelected }) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    const results = await getGeocode({ address });
    const { lat, lng } = await getLatLng(results[0]);
    setSelected({ lat, lng });
  };

  return (
    <Combobox onSelect={handleSelect}>
      <ComboboxInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        className="combobox-input"
        placeholder="Search an address"
      />
      <ComboboxPopover>
        <ComboboxList>
          {status === "OK" &&
            data.map(({ place_id, description }) => (
              <ComboboxOption key={place_id} value={description} />
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
};
