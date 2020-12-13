import React from 'react';
import Chart from 'react-apexcharts'
import emotions from './emotions.json';
import moment from 'moment';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      options: {
        chart: {
          id: 'apexchart',
        },
        yaxis: {
          min: 0.0,
          max: 1,
          tickAmount: 5,
          title: {
            text: "Attention"
          },
        },
        xaxis: {
          title: {
            text: "Time (Minutes)"
          },
        }
      },
      series: [],
      emotionData: [],
      participants: []
    }
  }

  sort = (item) => {
    item.data.sort((a, b) => {
      if (a.x < b.x)
        return -1;
      if (a.x > b.x)
        return 1;
      return 0;
    });
  }

  averageOfMinutesAttention = (data) => {
    var keys = ['minutes'];
    var count = {};
    let temp = []
    var result = []

    this.state.participants.forEach(item => {
      var result1 = data.reduce(function (r, o) {
        if (item === o.participantId) {
          var key = keys.map(function (k) { return o[k]; }).join('|');

          if (!count[key]) {

            count[key] = { sum: +o.attention.toString().replace(',', '.'), data: JSON.parse(JSON.stringify(o)) };
            count[key].data.attention = count[key].sum / count[key].data.count;
            count[key].data.count = 0;

            r.push(count[key]);
          } else {
            count[key].sum += +o.attention.toString().replace(',', '.');
            count[key].data.count = count[key].data.count + 1;
          }

          return r;
        } else {
          return r
        }
      }, []);

      result.push(result1)
    })

    var arrays = []
    var max = parseInt(result[0][0].data.minutes);
    var min = parseInt(result[0][0].data.minutes);

    result.forEach((item, i) => {
      temp = []
      item.forEach((item1, j) => {
        result[i][j].data.attention = (result[i][j].sum / result[i][j].data.count).toFixed(1)
        temp.push(item1.data)

        if (parseInt(item1.data.minutes) > max) {
          max = parseInt(item1.data.minutes)
        }

        if (parseInt(item1.data.minutes) < min) {
          min = parseInt(item1.data.minutes)
        }

        if (item.length - 1 === j) {
          arrays.push({
            name: item1.data.participantId,
            data: temp.map(item => [parseInt(item.minutes), item.attention])
          })
        }
      })

    })

    var totalMinutes = []
    for (var i = min; i <= max; i++) {
      totalMinutes.push(i)
    }

    var existingMinutes = []
    var existingMinutesTemp = []

    arrays.forEach(item => {
      existingMinutesTemp = []
      item.data.forEach(item1 => {
        existingMinutesTemp.push(item1[0])
      })
      existingMinutes.push(existingMinutesTemp)
    })

    const tempArr = arrays
    tempArr.forEach((item, j) => {
      for (var i = 0; i <= max - min; i++) {
        if (existingMinutes[j].indexOf(totalMinutes[i]) < 0) {
          arrays[j].data.push({ x: totalMinutes[i], y: null })
        }
      }
    })

    arrays.forEach((item, i) => {
      item.data.forEach((item1, j) => {
        if (item1.length) {
          arrays[i].data[j] = { x: item1[0], y: item1[1] }
        }
      })
    })

    arrays.forEach((item) => {
      this.sort(item)
    })

    this.setState({
      emotionData: temp,
      series: arrays
    })
  }

  componentDidMount() {
    let newArr = [];
    emotions.data.forEach((item, i) => {
      newArr.push({ ...item, minutes: moment(item.timestamp).format("mm") })
    })

    const participants = newArr.filter((v, i, a) => a.findIndex(t => (t.participantId === v.participantId)) === i)
    newArr.sort((a, b) => {
      if (parseInt(a.minutes) < parseInt(b.minutes))
        return -1;
      if (parseInt(a.minutes) > parseInt(b.minutes))
        return 1;
      return 0;
    });
    this.setState({ participants: participants.map(item => item.participantId) }, () => {
      this.averageOfMinutesAttention(newArr)
    })

  }

  render() {


    return (
      <div>
        <h1>Attention Score</h1>
        <Chart options={this.state.options} series={this.state.series} type="line" width={700} height={500} />
      </div>
    )
  }
}

export default App;
