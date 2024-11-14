"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChart = createChart;
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
const chart_js_1 = require("chart.js");
const chartjs_plugin_datalabels_1 = __importDefault(require("chartjs-plugin-datalabels"));
const fs = __importStar(require("fs"));
chart_js_1.Chart.register(chartjs_plugin_datalabels_1.default);
const width = 400;
const height = 400;
const chartJSNodeCanvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({
    width,
    height,
    backgroundColour: 'white',
});
// Updated createChart function to accept labels and data
function createChart(labels, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const configuration = {
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
        const image = yield chartJSNodeCanvas.renderToBuffer(configuration);
        const imagePath = './chart.png';
        fs.writeFileSync(imagePath, image);
        return imagePath; // Return the path to the generated image
    });
}
