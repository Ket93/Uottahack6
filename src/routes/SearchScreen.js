import React from "react";
import Autocomplete from "react-google-autocomplete";

function SearchScreen() {
  return (
    <Autocomplete
      apiKey="AIzaSyASDHVgsFIxrAM_HWWNRCN8_XioS2zX4RM"
      onPlaceSelected={(place) => {
        console.log(place);
      }}
    />
  )
}

export default React.memo(SearchScreen);
