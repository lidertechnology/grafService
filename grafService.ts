// lidertechLibCentralModule/servicios/graf-service.ts
import { Injectable, signal, WritableSignal } from '@angular/core';
import { ChartConfiguration, ChartType, Chart, ChartDataset } from 'chart.js';
import { StatesEnum } from '../enums/states.enum';

@Injectable({
  providedIn: 'root',
})
export class GrafService {
  public states: WritableSignal<StatesEnum> = signal(StatesEnum.DEFAULT);

  constructor() {
    Chart.register();
  }

  public crearConfiguracionGrafico(
    tipo: ChartType,
    etiquetas: string[],
    datasets: ChartDataset[],
    opciones: any = {}
  ): ChartConfiguration {
    return {
      type: tipo,
      data: {
        labels: etiquetas,
        datasets: datasets,
      },
      options: opciones,
    };
  }

  public crearGrafico(
    canvasId: string,
    configuracion: ChartConfiguration
  ): Chart | null {
    this.states.set(StatesEnum.LOADING);
    try {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) {
        this.states.set(StatesEnum.ERROR);
        return null;
      }
      const contexto = canvas.getContext('2d');
      const grafico = new Chart(contexto, configuracion);
      this.states.set(StatesEnum.SUCCESS);
      return grafico;
    } catch (error) {
      this.states.set(StatesEnum.ERROR);
      return null;
    }
  }

  public actualizarDatosGrafico(
    grafico: Chart,
    nuevaData: number[],
    etiquetaDataset: string
  ): void {
    if (!grafico) return;
    const datasetIndex = grafico.data.datasets.findIndex(ds => ds.label === etiquetaDataset);
    if (datasetIndex !== -1) {
      grafico.data.datasets[datasetIndex].data = nuevaData as any;
      grafico.update();
    }
  }
}
