"use client";
import React, { useState, useEffect } from "react";
import { Combobox } from "@/components/ui/cbox";
type LocationOption = {
  value: string;
  label: string;
};

type LocationArray = {
  selectsearch_options: LocationOption[];
  sendDataToParent?: any;
  dataName: string;
};
export function FreeTextSelectSearch({
  selectsearch_options,
  sendDataToParent,
  dataName,
}: LocationArray) {
  const [items, setItems] = useState(selectsearch_options || []); // Initialize with props if available

  const [txt1, setTxt1] = useState("");
  const appendToProps = (value: string) => {
    setItems((prevItems) => [...prevItems, { label: value, value: value }]); // Append the new value to the array
  };
  return (
    <>
      <Combobox
        mode="single"
        options={items}
        placeholder="Select option..."
        selected={txt1}
        onChange={(value) => {
          if (typeof value === "string") {
            sendDataToParent(value);
            setTxt1(value);
          }
        }}
        onCreate={(value) => {
          //handleCreateOptions(value);
          console.log(value);
          if (typeof value === "string") {
            appendToProps(value);
            sendDataToParent(value);
            setTxt1(value);
          }
        }}
      />
    </>
  );
}
