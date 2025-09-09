// src/app/componentes/dashboard-graficos/dashboard-graficos.component.ts
import { Component, OnDestroy, signal, WritableSignal, afterRender } from '@angular/core';
import { ReadService } from '../../servicios/read.service';
import { GrafService } from '../../servicios/graf-service';
import { StatesEnum } from '../../enums/states.enum';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-dashboard-graficos',
  standalone: true,
  template: `
    <div [ngSwitch]="states()">
      <div *ngSwitchCase="StatesEnum.LOADING">
        Cargando datos y gráficos...
      </div>
      <div *ngSwitchCase="StatesEnum.SUCCESS">
        <h2>Reporte de Ventas</h2>
        <div class="box-container">
          <canvas id="graficoBarras"></canvas>
          <canvas id="graficoLineas"></canvas>
          <canvas id="graficoCircular"></canvas>
        </div>
      </div>
      <div *ngSwitchCase="StatesEnum.ERROR">
        Error al cargar los datos.
      </div>
    </div>
  `,
})
export class DashboardGraficosComponent implements OnDestroy {
  public states: WritableSignal<StatesEnum> = signal(StatesEnum.DEFAULT);
  private graficos: Chart[] = [];

  constructor(
    private readService: ReadService,
    private grafService: GrafService
  ) {
    afterRender(async () => {
      await this.cargarDatosYGraficos();
    });
  }

  public async cargarDatosYGraficos(): Promise<void> {
    this.states.set(StatesEnum.LOADING);
    try {
      const datos = await this.readService.leerDocumentos('ventas');
      const etiquetas = datos.map((d: any) => d.producto);
      const valores = datos.map((d: any) => d.cantidad);

      const datasetVentas = [{
        label: 'Cantidad de Ventas',
        data: valores,
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
      }];

      const configBarras = this.grafService.crearConfiguracionGrafico('bar', etiquetas, datasetVentas);
      const graficoBarras = this.grafService.crearGrafico('graficoBarras', configBarras);
      if (graficoBarras) this.graficos.push(graficoBarras);

      const configLineas = this.grafService.crearConfiguracionGrafico('line', etiquetas, datasetVentas);
      const graficoLineas = this.grafService.crearGrafico('graficoLineas', configLineas);
      if (graficoLineas) this.graficos.push(graficoLineas);
      
      const configCircular = this.grafService.crearConfiguracionGrafico('pie', etiquetas, datasetVentas);
      const graficoCircular = this.grafService.crearGrafico('graficoCircular', configCircular);
      if (graficoCircular) this.graficos.push(graficoCircular);

      this.states.set(StatesEnum.SUCCESS);
    } catch (error) {
      this.states.set(StatesEnum.ERROR);
    }
  }

  ngOnDestroy(): void {
    this.graficos.forEach(grafico => grafico.destroy());
  }
}
