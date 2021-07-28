import client from './link.js';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ApolloProvider, useSubscription, gql } from '@apollo/client';
import Plot from 'react-plotly.js';

// I removed useQuery from the imports as I commented this function out
// Query const defined for GraphQL operations [Used for getting data from the past 30 minutes (1800 seconds) till now]
// const MULTIPLE_MEASUREMENTS = gql`
//   query GetMultipleMeasurements($name: String, $aft: Int!, $bef: Int!) {
//     # getMultipleMeasurements(input: { metricName: metrics, after: {Date.now - 1800}, before: {Date.now} }) {
//     getMultipleMeasurements(input: { metricName: $name, after: $aft - 1800, before: $bef }) {
//       metrics
//       measurments {
//         value
//         at
//       }
//     }
//   }
// `;

//Subscription const defined for GraphQL operations [Used for live data]
const NEW_MEASUREMENT = gql`
  subscription NewMeasurement {
    newMeasurement {
      value
      unit
      metric
      at
    }
  }
`;

//Reformats EPOCH time into Hours : Min : Sec.MilliSec
function format_time(time) {
  var date = new Date(time);
  var hours = date.getHours();
  var minutes = '0' + date.getMinutes();
  var seconds = '0' + date.getSeconds();
  var milliseconds = '0' + date.getMilliseconds();

  let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + '.' + milliseconds.substr(-3);
  return formattedTime;
}

var all_data = [];
var oilTemp = [];
var tubingPressure = [];
var casingPressure = [];
var waterTemp = [];
var injValveOpen = [];
var flareTemp = [];
var time = [];

//plotly chart, can be improved just need to do more reading on functionalities with respect to React
//A lot of time was spent on choosing charts, I ran into multiple issues, with Zing Chart, there were multiple bugs with their charts
//For ReCharts the way data needed to be input was inefficient
//Other charts were also researched on but ended up using plotly as a last resort
//I also needed to do more research on how to make it automatically refresh
class Graph extends React.Component {
  render() {
    return (
      <Plot
        data={[
          { x: time, y: oilTemp, name: 'Oil Temp (Fº)', type: 'line', mode: 'lines+markers', marker: { color: 'red' } },
          {
            x: time,
            y: tubingPressure,
            name: 'Tubing Pressure (PSI)',
            type: 'line',
            mode: 'lines+markers',
            marker: { color: 'blue' },
          },
          {
            x: time,
            y: casingPressure,
            name: 'Casing Pressure (PSI)',
            type: 'line',
            mode: 'lines+markers',
            marker: { color: 'yellow' },
          },
          {
            x: time,
            y: waterTemp,
            name: 'Water Temp (Fº)',
            type: 'line',
            mode: 'lines+markers',
            marker: { color: 'green' },
          },
          {
            x: time,
            y: injValveOpen,
            name: 'Inj Valve Open (%)',
            type: 'line',
            mode: 'lines+markers',
            marker: { color: 'black' },
          },
          {
            x: time,
            y: flareTemp,
            name: 'Flare Temp (Fº)',
            type: 'line',
            mode: 'lines+markers',
            marker: { color: 'orange' },
          },
        ]}
        layout={{
          title: 'Please Click on the LEGEND for the chart to update',
          width: 1500,
          height: 750,
          paper_bgcolor: 'rgba(187, 225, 250,0.65)',
          plot_bgcolor: 'rgb(162, 219, 250)',
          interval: 500,
        }}
      />
    );
  }
}

/* // Didn't have enough time to work on importing data from the last 30 minutes, but the idea is to do a loop 
      where we input different metrics query($s: String = metric[i]) then let it do it for all the metrics.
      Also the code can use some changes as you don't have to check for each metric, you can automatically extract it
function GetMultipleMeasurements($name: String = metrics, $aft: Int = 5, $bef: Int = 9) {
  const { loading, error, data } = useQuery(MULTIPLE_MEASUREMENTS);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  all_data = data.newMeasurement;
  function check_str(str) {
    return all_data.metric == str;
  }
  if (check_str('oilTemp')) {
    oilTemp.push(all_data.value);
    time.push(format_time(all_data.at));
  } else if (check_str('tubingPressure')) {
    tubingPressure.push(all_data.value);
  } else if (check_str('casingPressure')) {
    casingPressure.push(all_data.value);
  } else if (check_str('waterTemp')) {
    waterTemp.push(all_data.value);
  } else if (check_str('injValveOpen')) {
    injValveOpen.push(all_data.value);
  } else if (check_str('flareTemp')) {
    flareTemp.push(all_data.value);
  }
  return null;
}
*/

//Wanted to work on making this vary based on metric, but didn't have enough time as well as yesterday was mainly spent on cleaning the data and plotting it
function NewMeasurement() {
  const { loading, error, data } = useSubscription(NEW_MEASUREMENT);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  all_data = data.newMeasurement;
  function check_str(str) {
    return all_data.metric === str;
  }
  if (check_str('oilTemp')) {
    oilTemp.push(all_data.value);
    time.push(format_time(all_data.at));
  } else if (check_str('tubingPressure')) {
    tubingPressure.push(all_data.value);
  } else if (check_str('casingPressure')) {
    casingPressure.push(all_data.value);
  } else if (check_str('waterTemp')) {
    waterTemp.push(all_data.value);
  } else if (check_str('injValveOpen')) {
    injValveOpen.push(all_data.value);
  } else if (check_str('flareTemp')) {
    flareTemp.push(all_data.value);
  }
  return (
    <div>
      <Graph />
    </div>
  );
}

const rootElement = document.getElementById('root');

ReactDOM.render(
  <ApolloProvider client={client}>
    {/* <App /> */}
    <NewMeasurement />
  </ApolloProvider>,
  rootElement,
);

// function NewMeasurement() {
//   const { loading, error, data } = useSubscription(NEW_MEASUREMENT);

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error :(</p>;

//   return (
//     <div>
//       <p>
//         {/* {data.newMeasurement.metric} is {data.newMeasurement.value} {data.newMeasurement.unit} at :
//         {data.newMeasurement.at} */}
//         {data_all}
//       </p>
//     </div>
//   );
// }

// var data_all = [];
// for (let num = 30; num >= 0; num--) {
//   data_all.push({
//     metric: data_all.newMeasurement.metric,
//     value: data_all.newMeasurement.value,
//     unit: data_all.newMeasurement.unit,
//     at: data_all.newMeasurement.at,
//   });
// }

// function NewMeasurement() {
//   const { loading, error, data } = useSubscription(NEW_MEASUREMENT);

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error :(</p>;

//   return data.newMeasurement.map(newMeasurement, () => (
//     <div key={metric}>
//       <p>
//         {metric}: {value}
//       </p>
//     </div>
//   ));
// }

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
