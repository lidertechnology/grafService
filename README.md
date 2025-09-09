# Informe del Servicio GrafService y Componente de Ejemplo
El GrafService es la solución definitiva para la visualización de datos en todas tus aplicaciones Lidertech. 
Su diseño genérico te permite usarlo en cualquier componente, independientemente de la fuente de los datos, ya sean de LiderEnterprice o de LiderFinance.

El servicio se encarga de la lógica de los gráficos, mientras que la obtención de los datos recae en el componente. 
Esta separación de responsabilidades asegura un código limpio, optimizado y reutilizable.

# Uso del Servicio en un Componente
Para ilustrar cómo se usan los diferentes tipos de gráficos, crearemos un componente que obtiene datos de una colección de Firestore y los presenta en tres visualizaciones distintas: un gráfico de barras, uno circular y uno de líneas.

# Paso 1: Inyectar Servicios y Obtener Datos

En tu componente, inyecta el GrafService para manejar la lógica de los gráficos y el ReadService para obtener los datos de Firestore. 
Usa el StatesEnum y las señales para gestionar el estado de carga y error del componente.


# Paso 2: Preparar los Datos

Una vez que el ReadService te devuelva la información de la colección, debes formatearla para que Chart.js la entienda. 
El GrafService espera un array de etiquetas (strings) y un array de datasets (objetos).


# Paso 3: Crear y Renderizar los Gráficos

Utiliza el método crearConfiguracionGrafico del GrafService para cada tipo de gráfico que quieras mostrar (barras, líneas, etc.). 
Luego, llama a crearGrafico, pasándole el ID de un <canvas> en tu plantilla y la configuración que acabas de crear.

# Ejemplo de Componente
Aquí tienes el código de un componente que implementa este flujo completo.

TypeScript

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
