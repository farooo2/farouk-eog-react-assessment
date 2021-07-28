import client from './link.js';
import React, { Component } from 'react';
import { render } from 'react-dom';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.tsx';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, useSubscription, gql } from '@apollo/client';
import Plot from 'react-plotly.js';

// ReactDOM.render(
//   <ApolloProvider client={client}>
//     {/* <App /> */}
//     <Graph />
//   </ApolloProvider>,
//   rootElement,
// );
// ReactDOM.render

const MULTIPLE_MEASUREMENTS = gql`
  query GetMultipleMeasurements {
    # getMultipleMeasurements(input: { metricName: metrics, after: {Date.now - 3600}, before: {Date.now} }) {
    getMultipleMeasurements(input: { metricName: "oilTemp", after: 1627335348, before: 1627338948 }) {
      metrics
      measurments {
        value
        at
      }
    }
  }
`;

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

function format_time(time) {
  var date = new Date(time);
  var hours = date.getHours();
  var minutes = '0' + date.getMinutes();
  var seconds = '0' + date.getSeconds();
  var milliseconds = '0' + date.getMilliseconds();

  let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + ' ' + milliseconds.substr(-3);
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
var myDate;

class Graph extends React.Component {
  render() {
    return (
      <Plot
        data={[
          { x: time, y: oilTemp, type: 'line', mode: 'lines+markers', marker: { color: 'red' } },
          { x: time, y: casingPressure, type: 'line' },
        ]}
        layout={{ width: 1500, height: 750, title: 'A Fancy Plot' }}
      />
    );
  }
}

function NewMeasurement() {
  const { loading, error, data } = useSubscription(NEW_MEASUREMENT);
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
  // myDate = new Date(all_data.at);
  // time.push(myDate.toLocaleString());
  // console.log(time);

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
