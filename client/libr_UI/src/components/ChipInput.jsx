import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

export default function ChipInput({ label, value = [], onChange }) {
  const [inputValue, setInputValue] = useState("");
  const valueArray = Array.isArray(value) ? value : [];
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddChip = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!valueArray.includes(inputValue.trim())) {
        onChange([...valueArray, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const handleDeleteChip = (chipToDelete) => {
    onChange(value.filter((chip) => chip !== chipToDelete));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        gridColumn: label === "Keywords" ? "1 / -1" : "auto",
      }}
    >
      <TextField
        label={label}
        variant="outlined"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleAddChip}
        fullWidth
        placeholder={`Type and press Enter to add ${label.toLowerCase()}`}
      />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {value.map((item) => (
          <Chip
            key={item}
            label={item}
            onDelete={() => handleDeleteChip(item)}
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>
    </Box>
  );
}
