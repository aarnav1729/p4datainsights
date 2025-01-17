Papa.parse("sample.csv", {
    download: true,
    header: true,
    complete: function (results) {
        const data = results.data;
        console.log("Parsed Data:", data);

        if (data.length === 0) {
            console.error("No data available in CSV.");
            return;
        }

        initializeCharts(data);
    },
});

function filterData(data, operation) {
    return data.filter((d) => d.Operation === operation);
}

let pieChart, shiftBarChart, lineBarChart, cumulativeChart, cumulativeShiftChart, stackedBarChart;

function initializeCharts(data) {
    const finalELData = filterData(data, "Final EL");
    const pi90Data = filterData(data, "PI-90 Degree Visual Inspection");

    console.log("Final EL Data:", finalELData);
    console.log("PI-90 Degree Visual Inspection Data:", pi90Data);

    updateCharts(finalELData);

    window.showProcess = function (operation) {
        if (operation === "Final EL") {
            updateCharts(finalELData);
        } else {
            updateCharts(pi90Data);
        }

        document
            .querySelectorAll(".tab-button")
            .forEach((button) => button.classList.remove("active"));
        document
            .querySelector(`button[onclick="showProcess('${operation}')"]`)
            .classList.add("active");
    };

    document.querySelector(".line-btn[data-line='Line-1']").click();
    document.querySelector(".shift-btn[data-shift='A-Shift']").click();
}

function calculateCumulativeData(data) {
    let cumulativeTotal = 0;
    return data.map((entry) => {
        cumulativeTotal += parseFloat(entry["A+B+C Shift"]);
        return cumulativeTotal;
    });
}

function updateCharts(data) {
    const categories = data.map((d) => d.Category);
    const aShiftData = data.map((d) => parseFloat(d["A-Shift"]));
    const bShiftData = data.map((d) => parseFloat(d["B-Shift"]));
    const cShiftData = data.map((d) => parseFloat(d["C-Shift"]));
    const totalData = data.map((d) => parseFloat(d["A+B+C Shift"]));
    const cumulativeData = calculateCumulativeData(data);

    const totalOK = data
        .filter((d) => d.Category === "OK")
        .reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0);
    const totalMGrade = data
        .filter((d) => d.Category === "TOTAL M GRADE")
        .reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0);
    const totalLGrade = data
        .filter((d) => d.Category === "TOTAL L GRADE")
        .reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0);

    const line1Data = data
        .filter((d) => d.Line === "Line-1")
        .map((d) => parseFloat(d["A+B+C Shift"]));
    const line2Data = data
        .filter((d) => d.Line === "Line-2")
        .map((d) => parseFloat(d["A+B+C Shift"]));
    const line3Data = data
        .filter((d) => d.Line === "Line-3")
        .map((d) => parseFloat(d["A+B+C Shift"]));

    if (pieChart) pieChart.destroy();
    if (shiftBarChart) shiftBarChart.destroy();
    if (lineBarChart) lineBarChart.destroy();
    if (cumulativeChart) cumulativeChart.destroy();
    if (cumulativeShiftChart) cumulativeShiftChart.destroy();
    if (stackedBarChart) stackedBarChart.destroy();

    Chart.register(ChartDataLabels);


    const scalingFactor = 25;
    const okLineData = [
        data.filter((d) => d.Line === "Line-1" && d.Category === "OK").reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0),
        data.filter((d) => d.Line === "Line-2" && d.Category === "OK").reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0),
        data.filter((d) => d.Line === "Line-3" && d.Category === "OK").reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0)
    ];
    
    const mGradeLineData = [
        data.filter((d) => d.Line === "Line-1" && d.Category === "TOTAL M GRADE").reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0) * scalingFactor,
        data.filter((d) => d.Line === "Line-2" && d.Category === "TOTAL M GRADE").reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0) * scalingFactor,
        data.filter((d) => d.Line === "Line-3" && d.Category === "TOTAL M GRADE").reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0) * scalingFactor
    ];
    
    const lGradeLineData = [
        data.filter((d) => d.Line === "Line-1" && d.Category === "TOTAL L GRADE").reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0) * scalingFactor,
        data.filter((d) => d.Line === "Line-2" && d.Category === "TOTAL L GRADE").reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0) * scalingFactor,
        data.filter((d) => d.Line === "Line-3" && d.Category === "TOTAL L GRADE").reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0) * scalingFactor
    ];
    

    const stackedBarChartCtx = document.getElementById("stackedBarChart").getContext("2d");
    stackedBarChart = new Chart(stackedBarChartCtx, {
        type: "bar",
        data: {
            labels: ["Line 1", "Line 2", "Line 3"],
            datasets: [
                {
                    label: "OK",
                    data: okLineData,
                    backgroundColor: "rgba(0, 204, 0, 0.5)"
                },
                {
                    label: "M Grade",
                    data: mGradeLineData,
                    backgroundColor: "rgba(255, 165, 0, 0.5)"
                },
                {
                    label: "L Grade",
                    data: lGradeLineData,
                    backgroundColor: "rgba(255, 0, 0, 0.5)"
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Total Inspections"
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    display: true,
                    position: "top"
                },
                datalabels: {
                    display: true,
                    color: "#333",
                    font: {
                        weight: "bold"
                    },
                    formatter: (value, ctx) => {
                        return Math.round(value / scalingFactor);
                    }
                }
            }
        }
    });
    

    // Cumulative Line Chart by Shift
    const cumulativeShiftChartCtx = document.getElementById("cumulativeShiftChart").getContext("2d");
    cumulativeShiftChart = new Chart(cumulativeShiftChartCtx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: 'Cumulative Inspections - A Shift',
                data: calculateCumulativeDataByShift(data, 'A-Shift'),
                borderColor: 'rgb(153, 102, 255)',
                backgroundColor: 'rgba(153, 102, 255, 0.5)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Inspection Number"
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Cumulative Panels Inspected"
                    }
                }
            }
        }
    });

    document.querySelectorAll(".shift-btn").forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll(".shift-btn").forEach(button => button.classList.remove("active"));
            this.classList.add("active");

            const shiftKey = this.getAttribute('data-shift');
            const filteredData = filterDataByShift(data, shiftKey);
            const cumulativeData = calculateCumulativeDataByShift(filteredData, shiftKey);

            cumulativeShiftChart.data.labels = filteredData.map((_, idx) => `${idx + 1}`);
            cumulativeShiftChart.data.datasets[0].data = cumulativeData;
            cumulativeShiftChart.data.datasets[0].label = `Cumulative Inspections - ${shiftKey}`;
            cumulativeShiftChart.update();
        });
    });

    function filterDataByShift(data, shift) {
        return data.filter(d => parseFloat(d[shift]) > 0);
    }

    function calculateCumulativeDataByShift(data, shift) {
        let cumulativeTotal = 0;
        return data.map(entry => {
            cumulativeTotal += parseFloat(entry[shift]);
            return cumulativeTotal;
        });
    }



    const pieChartCtx = document.getElementById("pieChart").getContext("2d");
    pieChart = new Chart(pieChartCtx, {
        type: "pie",
        data: {
            labels: ["OK", "M Grade", "L Grade"],
            datasets: [
                {
                    data: [totalOK, totalMGrade, totalLGrade],
                    backgroundColor: [
                        "rgba(0, 204, 0, 0.5)",
                        "rgba(255, 165, 0, 0.5)",
                        "rgba(255, 0, 0, 0.5)",
                    ],
                    borderColor: [
                        "rgba(0, 204, 0, 1)",
                        "rgba(255, 165, 0, 1)",
                        "rgba(255, 0, 0, 1)",
                    ],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                datalabels: {
                    display: true,
                    color: "#333",
                    weight: "bold",
                    formatter: (value, ctx) => {
                        const total = ctx.chart.data.datasets[0].data.reduce(
                            (a, b) => a + b,
                            0
                        );
                        const percentage = ((value / total) * 100).toFixed(2) + "%";
                        return `${value} (${percentage})`;
                    },
                    anchor: (context) => {
                        const label = context.chart.data.labels[context.dataIndex];
                        return label === "M Grade"
                            ? "center"
                            : label === "L Grade"
                                ? "end"
                                : "end";
                    },
                    align: (context) => {
                        const label = context.chart.data.labels[context.dataIndex];
                        return label === "M Grade"
                            ? "end"
                            : label === "L Grade"
                                ? "start"
                                : "start";
                    },
                    offset: (context) => {
                        const label = context.chart.data.labels[context.dataIndex];
                        return label === "M Grade" ? -10 : label === "L Grade" ? 10 : 4;
                    },
                    rotation: (context) => {
                        return ["M Grade", "L Grade"].includes(
                            context.chart.data.labels[context.dataIndex]
                        )
                            ? -360
                            : 0;
                    },
                    font: {
                        size: 16,
                        weight: "bold",
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || "";
                            const value = context.raw;
                            const total = context.chart.data.datasets[0].data.reduce(
                                (a, b) => a + b,
                                0
                            );
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `${label}: ${value} (${percentage}%)`;
                        },
                    },
                },
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        font: {
                            size: 16,
                            weight: "bold",
                        },
                    },
                },
            },
        },
    });


    const cumulativeChartCtx = document.getElementById("cumulativeChart").getContext("2d");
    cumulativeChart = new Chart(cumulativeChartCtx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: 'Cumulative Inspections',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Inspection Number"
                    },
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Cumulative Inspection Count"
                    },
                }
            }
        }
    });

    document.querySelectorAll(".line-btn").forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll(".line-btn").forEach(button => button.classList.remove("active"));
            this.classList.add("active");

            const lineKey = this.getAttribute('data-line');
            const filteredData = data.filter(d => d.Line === lineKey);
            const cumulativeData = calculateCumulativeData(filteredData);

            cumulativeChart.data.labels = filteredData.map((_, idx) => `${idx + 1}`);
            cumulativeChart.data.datasets[0].data = cumulativeData;
            cumulativeChart.data.datasets[0].label = `Cumulative Inspections - ${lineKey}`;
            cumulativeChart.update();
        });
    });

    const shiftBarChartCtx = document
        .getElementById("shiftBarChart")
        .getContext("2d");
    shiftBarChart = new Chart(shiftBarChartCtx, {
        type: "bar",
        data: {
            labels: ["A Shift", "B Shift", "C Shift"],
            datasets: [
                {
                    label: "Total Inspections",
                    data: [
                        aShiftData.reduce((a, b) => a + b, 0),
                        bShiftData.reduce((a, b) => a + b, 0),
                        cShiftData.reduce((a, b) => a + b, 0),
                    ],
                    backgroundColor: [
                        "rgba(75, 192, 192, 0.5)",
                        "rgba(153, 102, 255, 0.5)",
                        "rgba(255, 159, 64, 0.5)",
                    ],
                    borderColor: [
                        "rgba(75, 192, 192, 1)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(255, 159, 64, 1)",
                    ],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Inspection Count",
                    },
                },
            },
            plugins: {
                datalabels: {
                    display: true,
                    anchor: "center",
                    align: "top",
                    formatter: Math.round,
                    color: "#333",
                    font: {
                        weight: "bold",
                    },
                    offset: 1,
                    padding: {
                        top: 0,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        },
                    },
                },
            },
        },
    });

    const lineBarChartCtx = document
        .getElementById("lineBarChart")
        .getContext("2d");
    lineBarChart = new Chart(lineBarChartCtx, {
        type: "bar",
        data: {
            labels: ["Line 1", "Line 2", "Line 3"],
            datasets: [
                {
                    label: "Total Inspections",
                    data: [
                        line1Data.reduce((a, b) => a + b, 0),
                        line2Data.reduce((a, b) => a + b, 0),
                        line3Data.reduce((a, b) => a + b, 0),
                    ],
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.5)",
                        "rgba(54, 162, 235, 0.5)",
                        "rgba(255, 206, 86, 0.5)",
                    ],
                    borderColor: [
                        "rgba(255, 99, 132, 1)",
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 206, 86, 1)",
                    ],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Inspection Count",
                    },
                },
            },
            plugins: {
                datalabels: {
                    display: true,
                    anchor: "center",
                    align: "top",
                    formatter: Math.round,
                    color: "#333",
                    font: {
                        weight: "bold",
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        },
                    },
                },
            },
        },
    });
    console.log("Categories:", categories);
    console.log("A Shift Data:", aShiftData);
    console.log("Total OK:", totalOK);
    console.log("Line 1 Data:", line1Data);

    document.addEventListener("load", function () {
        if (totalLGrade < 15) {

            var pieCanvas = document.getElementById("pieChart");
            var labelDiv = document.createElement("div");
            labelDiv.className = "arrow-label";
            labelDiv.innerHTML =
                "L Grade: " +
                totalLGrade +
                " (" +
                ((totalLGrade / (totalOK + totalMGrade + totalLGrade)) * 100).toFixed(
                    2
                ) +
                "%)";
            document.body.appendChild(labelDiv);

            labelDiv.style.left = pieCanvas.offsetLeft + 100 + "px"; 
            labelDiv.style.top = pieCanvas.offsetTop + 100 + "px"; 
        }
    });
}