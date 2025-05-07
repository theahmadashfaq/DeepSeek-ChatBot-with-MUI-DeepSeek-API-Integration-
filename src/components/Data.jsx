import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { Box, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { Chart } from "chart.js/auto";
import { Doughnut } from "react-chartjs-2";

export const Data = () => {
  const data1 = {
    labels: ['Work', 'Other Activity',],
    datasets: [
      {
        
        data: [19, 12],
        backgroundColor: ["#FF08A2", "#FF08A2"],
       
      },
    ],
  };

  const chartOptions = { 
    radius: "30%",
  };

  const workData = [1, 2, 3, 2, 2, 0, 0];
  const gamingData = [0, 0, 0, 0, 0, 4, 3];
  const data = {
    labels: ["Red", "Blue", "Yellow"],
    datasets: [
      {
        label: "My First Dataset",
        data: [300, 50, 100],
        backgroundColor: ["#2196f3", "#ff9800"],
        hoverOffset: 4,
      },
    ],
  };
  const config = {
    type: "doughnut",
    data: data,
  };

  const xLabels = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const colors = {
    work: "#2196f3",
    gaming: "#ff9800",
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box>
        <Typography variant="h3" fontWeight="bold" textAlign="center">
          My Weekly Activity Dashboard
        </Typography>

        <Box sx={{ mb: 4 }}>
          <BarChart
            height={400}
            series={[
              {
                data: workData,
                label: "Work Tasks",
                color: colors.work,
                stack: "total",
              },
              {
                data: gamingData,
                label: "Other Activity",
                color: colors.gaming,
                stack: "total",
              },
            ]}
            xAxis={[{ data: xLabels }]}
            yAxis={[{ label: "Number of Tasks", min: 0, max: 7 }]}
          />

          <PieChart
            series={[
              {
                data: [
                  { id: 0, value: 20, label: "Work Tasks" },
                  { id: 1, value: 10, label: "Other Activity" },
                ],
              },
            ]}
            width={200}
            height={200}
          />

          <Doughnut data={data1} options={chartOptions} />
        </Box>
      </Box>
    </Box>
  );
};
