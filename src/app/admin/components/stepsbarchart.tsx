"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// Register Chart.js modules
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface StepsBarChartProps {
  arr1: string[];
  arr2: string[];
}

const countOccurrences = (arr: string[]) => {
  const countMap: { [key: string]: number } = {};
  arr.forEach((item) => {
    countMap[item] = (countMap[item] || 0) + 1;
  });
  return countMap;
};

const StepsBarChart: React.FC<StepsBarChartProps> = ({ arr1, arr2 }) => {
  const filteredArr = arr1.filter((item) => item !== "Unknown Step");
  const fullMap = countOccurrences(filteredArr);
  const fullMap2 = countOccurrences(arr2);

  const sorryMap: { [key: string]: number } = {};
  const nonSorryMapMorrisons: { [key: string]: number } = {};
  const nonSorryMapNext: { [key: string]: number } = {};
  const nonSorryMapCoop: { [key: string]: number } = {};
  const nonSorryMapAsda: { [key: string]: number } = {};
  const nonSorryMapSainsburys: { [key: string]: number } = {};
  const nonSorryMapJusteat: { [key: string]: number } = {};
  const prevStepMap: { [key: string]: number } = {};

  for (const key in fullMap) {
    if (key.toLowerCase().includes("sorry")) {
      sorryMap[key] = fullMap[key];
    } else {
      if (key.toLowerCase().endsWith("morrisons")) {
        nonSorryMapMorrisons[key] = fullMap[key];
      } else if (key.toLowerCase().endsWith("next")) {
        nonSorryMapNext[key] = fullMap[key];
      } else if (key.toLowerCase().endsWith("coop")) {
        nonSorryMapCoop[key] = fullMap[key];
      } else if (key.toLowerCase().endsWith("asda")) {
        nonSorryMapAsda[key] = fullMap[key];
      } else if (key.toLowerCase().endsWith("sainsburys")) {
        nonSorryMapSainsburys[key] = fullMap[key];
      } else if (key.toLowerCase().endsWith("justeat")) {
        nonSorryMapJusteat[key] = fullMap[key];
      }
    }
  }

  for (const key in fullMap2) {
    prevStepMap[key] = fullMap2[key];
  }

  const createChartData = (
    dataMap: { [key: string]: number },
    color: string
  ) => {
    const desiredOrder = [
      "Reg Entry",
      "Landing Page",
      "Is This Your Car?",
      "Car Affected",
      "Purchase/Lease Date",
      "UK Resident",
      "England/Wales",
      "Dealership/Finance",
      "Already Started Claim",
      "Contact Info",
      "Future Marketing",
      "Privacy Policy",
      // Add all other steps in the desired order
    ];

    // Sort the keys based on the desiredOrder array
    const sortedKeys = Object.keys(dataMap).sort((a, b) => {
      const indexA = desiredOrder.indexOf(a);
      const indexB = desiredOrder.indexOf(b);
      return (
        (indexA === -1 ? Infinity : indexA) -
        (indexB === -1 ? Infinity : indexB)
      );
    });

    const labels: (string | string[])[] = sortedKeys.map((label) =>
      label.length > 15 ? label.match(/.{1,15}/g) || [label] : label
    );

    const values = sortedKeys.map((key) => dataMap[key]);
    const backgroundColors = sortedKeys.map(() => color);

    return {
      labels,
      datasets: [
        {
          label: "Number of Dropoffs",
          data: values,
          backgroundColor: backgroundColors,
        },
      ],
    };
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        ticks: {
          align: "center",
          maxRotation: 0,
          minRotation: 0,
        },
      },
    },
  };

  return (
    <div className="mt-10">
      <h1>
        <b>Question Dropoffs - Morrisons</b>
      </h1>
      <Bar
        data={createChartData(nonSorryMapMorrisons, "#faeb1b")}
        options={options}
      />
      <br></br>
      <h1>
        <b>Question Dropoffs - Next</b>
      </h1>
      <Bar
        data={createChartData(nonSorryMapNext, "#686e69")}
        options={options}
      />
      <br></br>
      <h1>
        <b>Question Dropoffs - Coop</b>
      </h1>
      <Bar
        data={createChartData(nonSorryMapCoop, "#386d7a")}
        options={options}
      />
      <br></br>
      <h1>
        <b>Question Dropoffs - Asda</b>
      </h1>
      <Bar
        data={createChartData(nonSorryMapAsda, "#249e33")}
        options={options}
      />
      <br></br>
      <h1>
        <b>Question Dropoffs - Sainsburys</b>
      </h1>
      <Bar
        data={createChartData(nonSorryMapSainsburys, "#c41f02")}
        options={options}
      />
      <br></br>
      <h1>
        <b>Question Dropoffs - JustEat</b>
      </h1>
      <Bar
        data={createChartData(nonSorryMapJusteat, "#e37d09")}
        options={options}
      />
      <br></br>
      <h1>
        <b>Sorry Page Dropoffs</b>
      </h1>
      <Bar data={createChartData(sorryMap, "#FF6384")} options={options} />
      <h1>
        <b>Reasons for Rejection</b>
      </h1>
      <Bar data={createChartData(prevStepMap, "#32a852")} options={options} />
    </div>
  );
};

export default StepsBarChart;
