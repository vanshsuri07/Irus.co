import React from "react";
import { SketchPicker } from "react-color";
import { useSnapshot } from "valtio";
import state from "../store";

const ColorPicker = () => {
  const snap = useSnapshot(state);
  return (
    <div className="absolute left-full ml-4">
      <SketchPicker
        color={snap.color}
        disableAlpha
        presetColors={[
          "#000000", // Black — classic, goes with everything
          "#FFFFFF", // White — clean and minimal
          "#808080", // Medium Gray — neutral and unisex
          "#E3DAC9", // Sand / Beige — earthy and trendy
          "#A52A2A", // Maroon — deep, rich color
          "#0047AB", // Cobalt Blue — bold but wearable
          "#228B22", // Forest Green — natural and balanced
          "#FF8C00", // Burnt Orange — energetic and eye-catching
          "#F5DEB3", // Wheat / Cream — soft, warm base
          "#800080", // Purple — vibrant and creative
          "#FFC0CB", // Pastel Pink — soft, popular in streetwear
          "#FF0000", // Red — classic attention-grabber
        ]}
        onChange={(color) => (state.color = color.hex)}
      />
    </div>
  );
};

export default ColorPicker;
