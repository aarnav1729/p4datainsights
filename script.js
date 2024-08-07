Papa.parse("sample.csv", {
    download: true,
    header: true,
    complete: function(results) {
        const data = results.data;
        console.log("Parsed Data:", data);

        if (data.length === 0) {
            console.error("No data available in CSV.");
            return;
        }
        
        initializeCharts(data);
    }
});

function filterData(data, operation) {
    return data.filter(d => d.Operation === operation);
}

let pieChart, shiftBarChart, lineBarChart;

function initializeCharts(data) {
    const finalELData = filterData(data, "Final EL");
    const pi90Data = filterData(data, "PI-90 Degree Visual Inspection");

    console.log("Final EL Data:", finalELData);
    console.log("PI-90 Degree Visual Inspection Data:", pi90Data);

    updateCharts(finalELData);

    window.showProcess = function(operation) {
        if (operation === "Final EL") {
            updateCharts(finalELData);
        } else {
            updateCharts(pi90Data);
        }

        document.querySelectorAll(".tab-button").forEach(button => button.classList.remove("active"));
        document.querySelector(`button[onclick="showProcess('${operation}')"]`).classList.add("active");
    };
}


function updateCharts(data) {

    const categories = data.map(d => d.Category);
    const aShiftData = data.map(d => parseFloat(d["A-Shift"]));
    const bShiftData = data.map(d => parseFloat(d["B-Shift"]));
    const cShiftData = data.map(d => parseFloat(d["C-Shift"]));
    const totalData = data.map(d => parseFloat(d["A+B+C Shift"]));

    const totalOK = data.filter(d => d.Category === "OK").reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0);
    const totalMGrade = data.filter(d => d.Category === "TOTAL M GRADE").reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0);
    const totalLGrade = data.filter(d => d.Category === "TOTAL L GRADE").reduce((sum, d) => sum + parseFloat(d["A+B+C Shift"]), 0);

    const line1Data = data.filter(d => d.Line === "Line-1").map(d => parseFloat(d["A+B+C Shift"]));
    const line2Data = data.filter(d => d.Line === "Line-2").map(d => parseFloat(d["A+B+C Shift"]));
    const line3Data = data.filter(d => d.Line === "Line-3").map(d => parseFloat(d["A+B+C Shift"]));

    if (pieChart) pieChart.destroy();
    if (shiftBarChart) shiftBarChart.destroy();
    if (lineBarChart) lineBarChart.destroy();


    Chart.register(ChartDataLabels);

    const pieChartCtx = document.getElementById("pieChart").getContext("2d");
    pieChart = new Chart(pieChartCtx, {
        type: "pie",
        data: {
            labels: ["OK", "M Grade", "L Grade"],
            datasets: [{
                data: [totalOK, totalMGrade, totalLGrade],
                backgroundColor: ["rgba(0, 204, 0, 0.5)", "rgba(255, 165, 0, 0.5)", "rgba(255, 0, 0, 0.5)"],
                borderColor: ["rgba(0, 204, 0, 1)", "rgba(255, 165, 0, 1)", "rgba(255, 0, 0, 1)"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                datalabels: {
                    display: true,
                    color: '#333',
                    formatter: (value, ctx) => {
                        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(2) + '%';
                        return `${value} (${percentage})`;
                    },
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || "";
                            const value = context.raw;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 16
                        }
                    }
                }
            }
        }
    });

    const shiftBarChartCtx = document.getElementById("shiftBarChart").getContext("2d");
    shiftBarChart = new Chart(shiftBarChartCtx, {
        type: "bar",
        data: {
            labels: ["A Shift", "B Shift", "C Shift"],
            datasets: [
                {
                    label: "Total Inspections",
                    data: [aShiftData.reduce((a, b) => a + b, 0), bShiftData.reduce((a, b) => a + b, 0), cShiftData.reduce((a, b) => a + b, 0)],
                    backgroundColor: ["rgba(75, 192, 192, 0.5)", "rgba(153, 102, 255, 0.5)", "rgba(255, 159, 64, 0.5)"],
                    borderColor: ["rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)", "rgba(255, 159, 64, 1)"],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Inspection Count"
                    }
                }
            },
            plugins: {
                datalabels: {
                    display: true,
                    anchor: 'end',
                    align: 'top',
                    formatter: Math.round,
                    color: '#333',
                    font: {
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });

    const lineBarChartCtx = document.getElementById("lineBarChart").getContext("2d");
    lineBarChart = new Chart(lineBarChartCtx, {
        type: "bar",
        data: {
            labels: ["Line 1", "Line 2", "Line 3"],
            datasets: [
                {
                    label: "Total Inspections",
                    data: [line1Data.reduce((a, b) => a + b, 0), line2Data.reduce((a, b) => a + b, 0), line3Data.reduce((a, b) => a + b, 0)],
                    backgroundColor: ["rgba(255, 99, 132, 0.5)", "rgba(54, 162, 235, 0.5)", "rgba(255, 206, 86, 0.5)"],
                    borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)"],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Inspection Count"
                    }
                }
            },
            plugins: {
                datalabels: {
                    display: true,
                    anchor: 'end',
                    align: 'top',
                    formatter: Math.round,
                    color: '#333',
                    font: {
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });
    console.log("Categories:", categories);
    console.log("A Shift Data:", aShiftData);
    console.log("Total OK:", totalOK);
    console.log("Line 1 Data:", line1Data);

    document.addEventListener('load', function() {
        if (totalLGrade < 15) { // Assuming a threshold for small slices
            var pieCanvas = document.getElementById('pieChart');
            var labelDiv = document.createElement('div');
            labelDiv.className = 'arrow-label';
            labelDiv.innerHTML = 'L Grade: ' + totalLGrade + ' (' + ((totalLGrade / (totalOK + totalMGrade + totalLGrade)) * 100).toFixed(2) + '%)';
            document.body.appendChild(labelDiv);
    
            // Adjust the positioning based on the canvas position
            labelDiv.style.left = pieCanvas.offsetLeft + 100 + 'px'; // Example values
            labelDiv.style.top = pieCanvas.offsetTop + 100 + 'px'; // Example values
        }
    });    
}