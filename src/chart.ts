import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { Chart, ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as fs from 'fs';

Chart.register(ChartDataLabels);

const width = 400;
const height = 400;
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour: 'white',
});

// Updated createChart function to accept labels and data
export async function createChart(labels: string[], data: number[]) {
  const configuration: ChartConfiguration = {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          label: 'Distribution',
          data,
          backgroundColor: ['#f39', '#25f', "#4543df", '#99ff11', '#ff9999', "#3ff", '#fe9'],
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { enabled: true },

        datalabels: {
          color: '#000',
          font: { weight: 'bold', size: 14 },
        },
      },
    },
  };

  // Generate the chart and save it to a file
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  const imagePath = './chart.png';
  fs.writeFileSync(imagePath, image);
  return imagePath; // Return the path to the generated image
}
