function createCombinedChart(category, data) {
  const graphContainer = d3.select("#graph-container");

  // Reset container content with layout structure
  graphContainer.html(`
    <div class="graphs-container">
      <h2 id="graphs-title" class="graphs-title">Section Title</h2>
      <div class="graphs-layout">
        <div class="left-panel">
          <div class="scatter-chart-title"></div>
          <svg id="experience-bar"></svg>
        </div>
        <div class="right-panel">
          <div class="pie-chart-container">
            <div class="pie-chart-title">Work Formats</div>
            <div class="pie-chart-row">
              <svg id="work-format-pie"></svg>
              <div id="pie-legend" class="pie-legend"></div>
            </div>
          </div>
          <div class="job-names-container">
            <h4>Job Titles</h4>
            <ul id="job-names-list"></ul>
          </div>
        </div>
      </div>
    </div>
  `);

  // Set the title dynamically based on the selected category
  document.getElementById("graphs-title").textContent = `${category}`;

  if (!data[category]) {
    graphContainer.html(`<p>No data for category: <strong>${category}</strong></p>`);
    return;
  }

  // Setup scatter plot dimensions and margins
  const leftPanel = document.querySelector(".left-panel");
  const containerWidth = leftPanel.clientWidth;
  const margin = { top: 10, right: 30, bottom: 60, left: 60 };
  const width = containerWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Add scatter plot title
  d3.select(".scatter-chart-title")
    .style("text-align", "center")
    .style("font-weight", "bold")
    .style("margin-bottom", "10px")
    .text(`Job Distribution by Experience: ${category}`);

  // Transform experience data into array and sort by predefined order
  const experienceOrder = ["Нет опыта", "От 1 года до 3 лет", "От 3 до 6 лет", "Более 6 лет"];
  const plotData = Object.entries(data[category].experience)
    .map(([experience, count]) => ({
      experience,
      count,
      order: experienceOrder.indexOf(experience)
    }))
    .sort((a, b) => a.order - b.order);

  const maxCount = d3.max(plotData, d => d.count);

  const scatterSvg = d3.select("#experience-bar")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(plotData.map(d => d.experience))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, maxCount])
    .range([height, 0]);

  // Define y-axis ticks dynamically
  const yTicks = Math.ceil(maxCount / 5);
  const yAxis = d3.axisLeft(y).ticks(maxCount / yTicks).tickFormat(d3.format("d"));

  scatterSvg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  scatterSvg.append("g")
    .call(yAxis);

  // Render scatter plot circles
  scatterSvg.selectAll(".dot")
    .data(plotData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", d => x(d.experience) + x.bandwidth() / 2)
    .attr("cy", d => y(d.count))
    .attr("r", 8)
    .attr("fill", "#9747ff")
    .attr("opacity", 0.8);

  // Add data labels next to each point
  scatterSvg.selectAll(".dot-label")
    .data(plotData)
    .enter()
    .append("text")
    .attr("class", "dot-label")
    .attr("x", d => x(d.experience) + x.bandwidth() / 2 + 15)
    .attr("y", d => y(d.count) + 5)
    .style("text-anchor", "start")
    .text(d => d.count)
    .attr("data-experience", d => d.experience)
    .attr("data-original", d => d.count)
    .each(function(d) {
      this._originalText = d.count;
    });

  // Create vertical and horizontal hover lines
  const xLine = scatterSvg.append("line")
    .attr("stroke", "#ff69b4")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "10 10")
    .attr("visibility", "hidden");

  const yLine = scatterSvg.append("line")
    .attr("stroke", "#ff69b4")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "10 10")
    .attr("visibility", "hidden");

  const totalCount = d3.sum(plotData, d => d.count);

  // Hover interactions for dots
  scatterSvg.selectAll(".dot")
    .on("mouseover", function(event, d) {
      const cx = x(d.experience) + x.bandwidth() / 2;
      const cy = y(d.count);

      xLine.attr("x1", cx).attr("y1", cy).attr("x2", cx).attr("y2", height).attr("visibility", "visible");
      yLine.attr("x1", 0).attr("y1", cy).attr("x2", cx).attr("y2", cy).attr("visibility", "visible");

      const percentage = ((d.count / totalCount) * 100).toFixed(1);

      scatterSvg.selectAll(".dot-label")
        .filter(function() {
          return d3.select(this).attr("data-experience") === d.experience;
        })
        .text(`${d.count} (${percentage}%)`)
        .style("fill", "#fff")
        .style("font-weight", "bold");
    })
    .on("mouseout", function(event, d) {
      xLine.attr("visibility", "hidden");
      yLine.attr("visibility", "hidden");

      scatterSvg.selectAll(".dot-label")
        .filter(function() {
          return d3.select(this).attr("data-experience") === d.experience;
        })
        .text(function() {
          return this._originalText;
        })
        .style("fill", "#fff")
        .style("font-weight", "normal");
    });

  // Add axis labels
  scatterSvg.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .style("text-anchor", "middle")
    .text("Required Experience");

  scatterSvg.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .style("text-anchor", "middle")
    .text("Number of Job Listings");

  // Prepare data for pie chart
  const pieData = Object.entries(data[category].work_format)
    .map(([label, value]) => ({ label, value }));

  const pieContainerWidth = 300;
  const pieHeight = 250;
  const radius = Math.min(pieContainerWidth, pieHeight) / 2;

  // Set pie chart title
  d3.select(".pie-chart-title")
    .style("text-align", "center")
    .style("font-weight", "bold")
    .style("margin-bottom", "10px")
    .text("Work Formats");

  const pieSvg = d3.select("#work-format-pie")
    .attr("viewBox", `0 0 ${pieContainerWidth} ${pieHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const chartGroup = pieSvg.append("g")
    .attr("transform", `translate(${pieContainerWidth / 2}, ${pieHeight / 2})`);

  const color = d3.scaleOrdinal()
    .domain(pieData.map(d => d.label))
    .range(["#9747ff", "#c01896", "#c89cd6", "#7d2a80"]);

  const pie = d3.pie().value(d => d.value);
  const arc = d3.arc()
    .outerRadius(radius)
    .innerRadius(0);

  const arcs = chartGroup.selectAll(".arc")
    .data(pie(pieData))
    .enter().append("g")
    .attr("class", "arc");

  // Draw pie chart segments and add hover interaction with legend
  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.label))
    .attr("data-label", d => d.data.label)
    .on("mouseover", function(event, d) {
      const label = d.data.label;
      d3.selectAll(`.legend-text[data-label='${label}']`)
        .style("transform", "scale(1.1)")
        .style("transform-origin", "left center")
        .style("color", "#c01896");
    })
    .on("mouseout", function(event, d) {
      const label = d.data.label;
      d3.selectAll(`.legend-text[data-label='${label}']`)
        .style("transform", "scale(1)")
        .style("color", "#fff");
    });

  // Create legend for pie chart
  const htmlLegend = d3.select("#pie-legend");
  htmlLegend.html("");

  pieData.forEach(d => {
    const item = htmlLegend.append("div")
      .attr("class", "legend-item")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-bottom", "6px");

    item.append("span")
      .style("display", "inline-block")
      .style("width", "12px")
      .style("height", "12px")
      .style("border-radius", "50%")
      .style("background-color", color(d.label))
      .style("margin-right", "8px");

    item.append("span")
      .attr("class", "legend-text")
      .attr("data-label", d.label)
      .text(`${d.label}: ${d.value}`);
  });

  // Show percentage inside pie segments
  const totalValue = d3.sum(pieData, d => d.value);

  arcs.append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("dy", "0.35em")
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", "#fff")
    .text(d => {
      const percentage = (d.data.value / totalValue) * 100;
      return percentage > 7 ? `${percentage.toFixed(1)}%` : "";
    });

  // Populate job names list
  const jobNames = data[category].job_names || [];
  const jobNamesList = d3.select("#job-names-list");

  jobNamesList.html("");

  jobNamesList.selectAll("li")
    .data(jobNames)
    .enter()
    .append("li")
    .text(d => d);

  // Set column layout based on job list size
  const jobNamesListElement = document.querySelector("#job-names-list");
  const jobNamesContainer = document.querySelector(".job-names-container");
  const columnCount = jobNames.length <= 1 ? "1" : "2";

  jobNamesListElement.style.setProperty("--column-count", columnCount);
  jobNamesContainer.setAttribute("data-columns", columnCount);
}

// Update chart when category changes
function updateGraph(category) {
  const graphContainer = d3.select("#graph-container");
  graphContainer.html('<div class="loading">Loading data...</div>');

  d3.json("../data/vacancies.json").then(data => {
    d3.select("#experience-bar").selectAll("*").remove();
    d3.select("#work-format-pie").selectAll("*").remove();
    d3.select("#job-names-list").selectAll("*").remove();

    const categoryData = data.categories[category];
    if (categoryData) {
      createCombinedChart(category, data.categories);
    } else {
      graphContainer.html(`<p>No data for category: <strong>${category}</strong></p>`);
    }
  }).catch(error => {
    console.error("Error loading data:", error);
    graphContainer.html("<p>Error loading data</p>");
  });
}

// Handle category selection from buttons
document.querySelectorAll(".button-bar button").forEach(button => {
  button.addEventListener("click", () => {
    const category = button.getAttribute("data-category");
    updateGraph(category);
  });
});

// Initialize chart on page load
document.addEventListener("DOMContentLoaded", function() {
  const defaultCategory = document.querySelector(".button-bar button").getAttribute("data-category");
  updateGraph(defaultCategory);
});
