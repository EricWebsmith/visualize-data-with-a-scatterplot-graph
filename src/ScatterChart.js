import { useEffect } from "react";
import { useRef } from "react";
import * as d3 from 'd3';
import { doping } from './doping';
import * as _ from 'lodash'
import './ScatterChart.css'
import { color } from "d3";


export default function ScatterChart() {

  const d3Chart = useRef();

  useEffect(() => {
    const div = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .attr('id', 'tooltip')
      .style('opacity', 0);

    const width = 750;
    const height = 400;
    const padding = 50;

    doping.forEach(d => {
      const parsedTime = d.Time.split(':');
      d.Time1970 = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
    });

    const minTime = _.minBy(doping, d => d.Time1970).Time1970;
    const maxTime = _.maxBy(doping, d => d.Time1970).Time1970;
    const minYear = _.minBy(doping, d => d.Year).Year - 1;
    const maxYear = _.maxBy(doping, d => d.Year).Year + 1;

    const svg = d3.select(d3Chart.current);
    svg.attr('width', width).attr('height', height);

    const yScale = d3.scaleTime()
      .domain([minTime, maxTime])
      .range([padding, height - padding]);

    const xScale = d3.scaleLinear()
      .domain([minYear, maxYear])
      .range([padding, width - padding]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.timeFormat('%M:%S'));

    svg.append('g')
      .attr('transform', `translate(${padding}, 0)`)
      .call(yAxis);

    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format('d'));

    svg.append('g')
      .attr('transform', `translate(0, ${height - padding})`)
      .call(xAxis)



    svg
      .selectAll('.dot')
      .data(doping)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('r', 6)
      .attr('cx', d => xScale(d.Year))
      .attr('cy', d => yScale(d.Time1970))
      .attr('date-xvalue', d => d.Year)
      .attr('data-yvalue', d => d.Time1970.toISOString())
      .style('fill', d => colorScale(d.Doping !== ''))
      .on('mouseover', function (event, d) {
        div.style('opacity', 0.9);
        div.attr('data-year', d.Year);
        div
          .html(
            d.Name +
            ': ' +
            d.Nationality +
            '<br/>' +
            'Year: ' +
            d.Year +
            ', Time: ' +
            d3.timeFormat('%M:%S')(d.Time) +
            (d.Doping ? '<br/><br/>' + d.Doping : '')
          )
          .style('left', event.pageX + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', function () {
        div.style('opacity', 0);
      });


    var legendContainer = svg.append('g').attr('id', 'legend');

    var legend = legendContainer
      .selectAll('#legend')
      .data(colorScale.domain())
      .enter()
      .append('g')
      .attr('class', 'legend-label')
      .attr('transform', function (d, i) {
        return 'translate(0,' + (height / 2 - i * 20) + ')';
      });

    legend
      .append('rect')
      .attr('x', width - 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', colorScale);

    legend
      .append('text')
      .attr('x', width - 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text(function (d) {
        if (d) {
          return 'Riders with doping allegations';
        } else {
          return 'No doping allegations';
        }
      });
  }, []);



  return (
    <>
      <div className='main'>
        <div className="container">
          <h1>Doping in Professional Bicycle Racing</h1>
          <div className="visHolder">
            <svg ref={d3Chart}></svg>
          </div>

        </div>

      </div>
    </>

  )
}