import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let query = '';
let selectedIndex = -1;
let selectedYear = null;
const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;

function renderPieChart(projectsGiven) {
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );


  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  selectedIndex = data.findIndex((d) => d.label === selectedYear);

  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();

  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  arcs.forEach((arc, i) => {
  svg
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(i))
    .attr('class', selectedIndex === i ? 'selected' : '')
    .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        selectedYear = selectedIndex === -1 ? null : data[selectedIndex].label;

      svg
        .selectAll('path')
        .attr('class', (_, idx) =>
          selectedIndex === idx ? 'selected' : '',
        );

      legend
        .selectAll('li')
        .attr('class', (_, idx) =>
          selectedIndex === idx
            ? 'legend-item selected'
            : 'legend-item',
        );
        
        let filteredProjects = projects.filter((project) => {
            let values = Object.values(project).join('\n').toLowerCase();
            let matchesQuery = values.includes(query.toLowerCase());
            let matchesYear = selectedYear === null || project.year === selectedYear;

        return matchesQuery && matchesYear;
        });

    renderProjects(filteredProjects, projectsContainer, 'h2');
    });
  });

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('class', selectedIndex === idx
        ? 'legend-item selected'
        : 'legend-item')
      .attr('style', `--color:${colors(idx)}`)
      .html(`
        <span class="swatch"></span>
        ${d.label} <em>(${d.value})</em>
      `);
  });
}

renderPieChart(projects);

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value;

  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  let visibleProjects = filteredProjects.filter(
    (project) => selectedYear === null || project.year === selectedYear,
  );

  renderProjects(visibleProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});