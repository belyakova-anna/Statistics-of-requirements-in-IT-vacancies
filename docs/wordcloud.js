const width = window.innerWidth;
const height = window.innerHeight;

// Helper function to measure the rendered width of text with a given font size
function measureText(text, fontSize = 16) {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.visibility = 'hidden';
  container.style.whiteSpace = 'nowrap';

  const measurer = document.createElement('span');
  measurer.style.fontSize = `${fontSize}px`;
  measurer.textContent = text;

  container.appendChild(measurer);
  document.body.appendChild(container);

  const width = measurer.offsetWidth;

  document.body.removeChild(container);

  return width;
}

d3.json("./data/vacancies.json").then(data => {
  const entries = Object.entries(data.top_key_skills);

  const counts = entries.map(([_, count]) => count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  // Color scale to vary the color of the circles based on frequency
  const colorScale = d3.scaleLinear()
    .domain([minCount, maxCount])
    .range(["#9747ff", "#c01896"]);

  // Radius scale to vary the size of the circles based on frequency
  const radiusScale = d3.scaleSqrt()
    .domain([minCount, maxCount])
    .range([30, 100]);

  // Function to wrap text into multiple lines based on a maximum width
  function wrapText(text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + " " + word;
      const testWidth = measureText(testLine);

      // If the line exceeds the maximum width, start a new line
      if (testWidth > maxWidth * 1.8) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  // Create nodes with wrapped text and calculated dimensions
  const nodes = entries.map(([text, count]) => {
    const radius = radiusScale(count);
    const maxTextWidth = radius * 1.8;
    const wrappedText = wrapText(text, maxTextWidth);
    const lineHeight = 16;
    const textHeight = wrappedText.length * lineHeight;

    return {
      text,
      wrappedText,
      count,
      radius,
      fontSize: 16,
      lineHeight,
      textHeight,
      totalRadius: Math.max(radius, textHeight / 2),
      x: Math.max(radius, Math.min(width - radius, Math.random() * width)),
      y: Math.max(radius, Math.min(height - radius, Math.random() * height))
    };
  });

  const svg = d3.select("#wordcloud")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "100%")
    .style("display", "block");

  const container = svg.append("g");

  // Setup force simulation to handle collision detection and centering of the nodes
  const simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(5))
    .force("collision", d3.forceCollide()
      .radius(d => d.totalRadius + 5)
      .strength(0.7))
    .force("x", d3.forceX(width / 2).strength(0.01))
    .force("y", d3.forceY(height / 2).strength(0.01))
    .force("boundary", () => {
      // Ensure nodes stay within the defined bounds of the SVG
      nodes.forEach(node => {
        node.x = Math.max(node.totalRadius, Math.min(width - node.totalRadius, node.x));
        node.y = Math.max(node.totalRadius, Math.min(height - node.totalRadius, node.y));
      });
    })
    .on("tick", ticked);

  // Draw circles and wrapped text for each node during each simulation tick
  function ticked() {
    // Draw circles representing each node
    container.selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => d.radius)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("fill", d => colorScale(d.count))
      .attr("opacity", 0.85);

    // Clear previous text elements before re-rendering
    container.selectAll("g.text-group").remove();

    // Add wrapped text inside each circle
    nodes.forEach(node => {
      const textGroup = container.append("g")
        .attr("class", "text-group")
        .attr("transform", `translate(${node.x},${node.y})`);

      node.wrappedText.forEach((line, i) => {
        textGroup.append("text")
          .text(line)
          .attr("y", i * node.lineHeight - (node.wrappedText.length - 1) * node.lineHeight / 2)
          .attr("text-anchor", "middle")
          .style("fill", "white")
          .style("font-size", `${node.fontSize}px`);
      });
    });
  }
}).catch(error => {
  console.error("Error loading data:", error);
});
