"use client";
import { updateItemPerPage } from "@/app/admin/actions";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PaginationDropdown = ({
  initialItemsPerPage,
}: {
  initialItemsPerPage: number;
}) => {
  const [itemsPerPage, setItemsPerPage] = useState<number>(initialItemsPerPage);

  const handleSelectChange = (txt: string) => {
    const selectedValue = parseInt(txt);
    setItemsPerPage(selectedValue);
    const params = new URLSearchParams(window.location.search);
    updateItemPerPage(params.toString(), selectedValue);
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span>Displaying &nbsp;</span>
      <div style={{ margin: "0 5px" }}>
        {" "}
        {/* Wrapping div for margin */}
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(str) => {
            handleSelectChange(str);
          }}
        >
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder="Select items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <span>&nbsp; leads per page</span>
    </div>
  );
};

export default PaginationDropdown;
