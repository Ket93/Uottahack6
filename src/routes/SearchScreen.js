import React from "react";
import '../styles/SearchScreen.css'
import { useNavigate } from "react-router-dom";
import { useLoadScript } from "@react-google-maps/api";

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

function Search() {

  const [departure, setDeparture] = useState(null);
  const [destination, setDestination] = useState(null);
  const [battery, setBattery] = useState(0);

  const navigate = useNavigate();

  const handleBatteryChange = (e) => {
    setBattery(e.target.value)
  }
  
  return (
    <div className="SearchScreen">
      <div className="searches">
        <div className="dep">
          <PlacesAutocomplete setSelected={setDeparture}/>
        </div>
        <div className="des">
          <PlacesAutocomplete setSelected={setDestination}/>
        </div>
        <div className="battery">
          <input className="battery_input" type="range"  min="0" max="100" 
            value={battery}
            onChange={handleBatteryChange}
          />
          <div>
            <label for="battery">Battery {battery}%</label>
          </div>
        </div>
      </div>
      <div>
        <a onClick={() => {
            console.log(battery)
            navigate('/map', {state: {dep: departure, des: destination, bat: battery}});
          }}
        >
          click me
        </a>
      </div>
    </div>
  )
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

